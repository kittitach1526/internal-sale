from fastapi import APIRouter, HTTPException, Query, Depends

from pydantic import BaseModel

from typing import List, Optional

from datetime import datetime, timedelta

import psycopg2

import os

from psycopg2.extras import RealDictCursor



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



# Database configuration

DB_CONFIG = {

    'host': os.getenv('DB_HOST', 'localhost'),

    'database': os.getenv('DB_NAME', 'salesdb'),

    'user': os.getenv('DB_USER', 'postgres'),

    'password': os.getenv('DB_PASSWORD', 'energy2023'),

    'port': os.getenv('DB_PORT', '5432')

}



def get_db_connection():

    """สร้างการเชื่อมต่อฐานข้อมูล PostgreSQL"""

    try:

        conn = psycopg2.connect(**DB_CONFIG)

        return conn

    except Exception as e:

        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")



def init_logs_table():

    """ตรวจสอบว่าตาราง logs มีอยู่แล้วใน PostgreSQL"""

    # ตาราง logs ถูกสร้างไว้แล้วใน init_database.py

    pass



# Initialize table on module import

init_logs_table()



@router.post("/logs", response_model=dict)

async def create_log(log: LogEntry):

    """สร้าง log entry ใหม่"""

    conn = get_db_connection()

    cursor = conn.cursor()

    

    try:

        # ดึงข้อมูล IP และ User Agent ถ้าไม่ได้ส่งมา

        ip = log.ip or "127.0.0.1"

        user_agent = log.user_agent or "Unknown"

        

        # สร้าง timestamp ปัจจุบัน

        now = datetime.now()

        

        # Extract user_id from user string (format: "Name (email)")

        user_id = 1  # Default to admin

        if log.user and '(' in log.user and ')' in log.user:

            try:

                user_email = log.user.split('(')[1].split(')')[0].strip()

                # Query to get user_id from email

                cursor.execute("SELECT id FROM users WHERE email = %s", (user_email,))

                user_result = cursor.fetchone()

                if user_result:

                    user_id = user_result[0]

            except:

                pass  # Fallback to user_id = 1

        

        cursor.execute('''

            INSERT INTO logs (user_id, action)

            VALUES (%s, %s)

            RETURNING id

        ''', (user_id, log.action))  

        

        log_id = cursor.fetchone()[0]

        conn.commit()

        

        return {

            "success": True,

            "message": "Log created successfully",

            "log_id": log_id

        }

        

    except Exception as e:

        conn.rollback()

        raise HTTPException(status_code=500, detail=f"Failed to create log: {str(e)}")

    finally:

        cursor.close()

        conn.close()



@router.get("/logs", response_model=dict)

async def get_logs(

    page: int = Query(1, ge=1),

    limit: int = Query(50, ge=1, le=1000),

    q: Optional[str] = Query(None)

):

    """ดึงข้อมูล logs ทั้งหมด"""

    conn = get_db_connection()

    cursor = conn.cursor(cursor_factory=RealDictCursor)

    

    try:

        # สร้าง query พื้นฐาน - JOIN กับตาราง users เพื่อดึงชื่อ

        query = """

            SELECT l.id, l.user_id, l.action, l.created_at, u.name as user_name

            FROM logs l

            LEFT JOIN users u ON l.user_id = u.id

        """

        params = []

        

        # เพิ่มการค้นหาถ้ามี (ค้นหาใน action)

        if q:

            query += " WHERE l.action ILIKE %s"

            params.append(f"%{q}%")

        

        # เพิ่มการเรียงลำดับและ pagination

        query += " ORDER BY l.created_at DESC LIMIT %s OFFSET %s"

        params.extend([limit, (page - 1) * limit])

        

        cursor.execute(query, params)

        logs = cursor.fetchall()

        

        # นับจำนวน logs ทั้งหมด

        count_query = """

            SELECT COUNT(*) as total 

            FROM logs l

        """

        if q:

            count_query += " WHERE l.action ILIKE %s"

            cursor.execute(count_query, [params[0]])

        else:

            cursor.execute(count_query)

        total_count = cursor.fetchone()['total']

        

        # แปลงข้อมูลเป็น dict

        log_list = []

        for log in logs:

            user_name = log.get("user_name") or f"User {log['user_id']}"

            log_list.append({

                "id": log["id"],

                "user_id": log["user_id"],

                "action": log["action"],

                "created_at": log["created_at"].strftime("%d %b %Y %H:%M:%S") if log["created_at"] else None,

                "date": log["created_at"].strftime("%d %b %Y") if log["created_at"] else None,

                "time": log["created_at"].strftime("%H:%M:%S") if log["created_at"] else None,

                "user": user_name  # แสดงชื่อจริง ถ้ามี

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

    finally:

        cursor.close()

        conn.close()



@router.get("/logs/statistics", response_model=dict)

async def get_log_statistics():

    """ดึงสถิติ logs"""

    conn = get_db_connection()

    cursor = conn.cursor(cursor_factory=RealDictCursor)

    

    try:

        # จำนวน logs ทั้งหมด

        cursor.execute("SELECT COUNT(*) as total FROM logs")

        total_logs = cursor.fetchone()['total']

        

        # สถิติตามวันที่ (7 วันล่าสุด)

        cursor.execute("""

            SELECT DATE(created_at) as date, COUNT(*) as count 

            FROM logs 

            WHERE created_at >= NOW() - INTERVAL '7 days'

            GROUP BY DATE(created_at) 

            ORDER BY date DESC

        """)

        daily_stats = cursor.fetchall()

        

        return {

            "success": True,

            "statistics": {

                "total_logs": total_logs,

                "daily": [dict(row) for row in daily_stats]

            }

        }

        

    except Exception as e:

        raise HTTPException(status_code=500, detail=f"Failed to fetch statistics: {str(e)}")

    finally:

        cursor.close()

        conn.close()



@router.delete("/logs/cleanup")

async def cleanup_old_logs(days_old: int = Query(90, ge=1)):

    """ลบ logs เก่ากว่าจำนวนวันที่กำหนด"""

    conn = get_db_connection()

    cursor = conn.cursor()

    

    try:

        cursor.execute("""

            DELETE FROM logs 

            WHERE created_at < NOW() - INTERVAL '%s days'

        """, (days_old,))

        

        deleted_count = cursor.rowcount

        conn.commit()

        

        return {

            "success": True,

            "message": f"Deleted {deleted_count} old log entries",

            "deleted_count": deleted_count

        }

        

    except Exception as e:

        conn.rollback()

        raise HTTPException(status_code=500, detail=f"Failed to cleanup logs: {str(e)}")

    finally:

        cursor.close()

        conn.close()

