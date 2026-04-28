from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import sqlite3
import os

router = APIRouter()

# Pydantic models
class LogEntry(BaseModel):
    user: str
    action: str
    detail: str
    type: str = "info"
    ip: Optional[str] = None
    user_agent: Optional[str] = None

class LogResponse(BaseModel):
    id: int
    user: str
    action: str
    detail: str
    type: str
    ip: Optional[str]
    user_agent: Optional[str]
    timestamp: str
    date: str
    time: str

# Database setup
def get_db_connection():
    # Path ไปยัง database ในโฟลเดอร์ server
    db_path = os.path.join(os.path.dirname(__file__), '..', 'database.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_logs_table():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # สร้างตาราง logs ถ้ายังไม่มี
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT NOT NULL,
            action TEXT NOT NULL,
            detail TEXT NOT NULL,
            type TEXT DEFAULT 'info',
            ip TEXT,
            user_agent TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            date TEXT,
            time TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize table on module import
init_logs_table()

@router.post("/logs", response_model=dict)
async def create_log(log: LogEntry):
    """สร้าง log entry ใหม่"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # ดึงข้อมูล IP และ User Agent ถ้าไม่ได้ส่งมา
        ip = log.ip or "127.0.0.1"
        user_agent = log.user_agent or "Unknown"
        
        # สร้าง timestamp ปัจจุบัน
        now = datetime.now()
        timestamp = now.strftime("%Y-%m-%d %H:%M:%S")
        date = now.strftime("%d %b %Y")
        time = now.strftime("%H:%M:%S")
        
        cursor.execute('''
            INSERT INTO logs (user, action, detail, type, ip, user_agent, timestamp, date, time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (log.user, log.action, log.detail, log.type, ip, user_agent, timestamp, date, time))
        
        log_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": "Log created successfully",
            "log_id": log_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create log: {str(e)}")

@router.get("/logs", response_model=dict)
async def get_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=1000),
    q: Optional[str] = Query(None)
):
    """ดึงข้อมูล logs ทั้งหมด"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # สร้าง query พื้นฐาน
        query = "SELECT * FROM logs"
        params = []
        
        # เพิ่มการค้นหาถ้ามี
        if q:
            query += " WHERE user LIKE ? OR action LIKE ? OR detail LIKE ?"
            params.extend([f"%{q}%", f"%{q}%", f"%{q}%"])
        
        # เพิ่มการเรียงลำดับและ pagination
        query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
        params.extend([limit, (page - 1) * limit])
        
        cursor.execute(query, params)
        logs = cursor.fetchall()
        
        # นับจำนวน logs ทั้งหมด
        count_query = "SELECT COUNT(*) as total FROM logs"
        if q:
            count_query += " WHERE user LIKE ? OR action LIKE ? OR detail LIKE ?"
            cursor.execute(count_query, params[-3:])  # ใช้ params เดิมจากการค้นหา
        else:
            cursor.execute(count_query)
        total_count = cursor.fetchone()['total']
        
        conn.close()
        
        # แปลงข้อมูลเป็น dict
        log_list = []
        for log in logs:
            log_list.append({
                "id": log["id"],
                "user": log["user"],
                "action": log["action"],
                "detail": log["detail"],
                "type": log["type"],
                "ip": log["ip"],
                "user_agent": log["user_agent"],
                "timestamp": log["timestamp"],
                "date": log["date"],
                "time": log["time"]
            })
        
        return {
            "success": True,
            "data": log_list,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total_count,
                "total_pages": (total_count + limit - 1) // limit
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch logs: {str(e)}")

@router.get("/logs/statistics", response_model=dict)
async def get_log_statistics():
    """ดึงสถิติ logs"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # สถิติตามประเภท
        cursor.execute("SELECT type, COUNT(*) as count FROM logs GROUP BY type")
        type_stats = cursor.fetchall()
        
        # สถิติตามวันที่ (7 วันล่าสุด)
        cursor.execute("""
            SELECT date, COUNT(*) as count 
            FROM logs 
            WHERE timestamp >= datetime('now', '-7 days')
            GROUP BY date 
            ORDER BY date DESC
        """)
        daily_stats = cursor.fetchall()
        
        # จำนวน logs ทั้งหมด
        cursor.execute("SELECT COUNT(*) as total FROM logs")
        total_logs = cursor.fetchone()['total']
        
        conn.close()
        
        return {
            "success": True,
            "statistics": {
                "total_logs": total_logs,
                "by_type": [dict(row) for row in type_stats],
                "daily": [dict(row) for row in daily_stats]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch statistics: {str(e)}")

@router.delete("/logs/cleanup")
async def cleanup_old_logs(days_old: int = Query(90, ge=1)):
    """ลบ logs เก่ากว่าจำนวนวันที่กำหนด"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM logs 
            WHERE timestamp < datetime('now', '-{} days')
        """.format(days_old))
        
        deleted_count = cursor.rowcount
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": f"Deleted {deleted_count} old log entries",
            "deleted_count": deleted_count
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cleanup logs: {str(e)}")
