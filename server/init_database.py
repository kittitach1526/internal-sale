#!/usr/bin/env python3
"""
Database Initialization Script
สคริปต์สำหรับสร้างตารางทั้งหมดในฐานข้อมูล PostgreSQL
สามารถรันได้ทุกที่โดยไม่ต้องพึ่งพาการตั้งค่าจากภายนอก

วิธีใช้:
python init_database.py

หรือตั้งค่า environment variables:
export DB_HOST=localhost
export DB_NAME=salesdb
export DB_USER=postgres
export DB_PASSWORD=your_password
python init_database.py
"""

import os
import psycopg2
import sys
from psycopg2 import OperationalError

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'salesdb'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'energy2023'),
    'port': os.getenv('DB_PORT', '5432')
}

def create_connection():
    """สร้างการเชื่อมต่อฐานข้อมูล"""
    try:
        print("🔗 กำลังเชื่อมต่อฐานข้อมูล...")
        print(f"   Host: {DB_CONFIG['host']}")
        print(f"   Database: {DB_CONFIG['database']}")
        print(f"   User: {DB_CONFIG['user']}")
        print(f"   Port: {DB_CONFIG['port']}")
        
        conn = psycopg2.connect(**DB_CONFIG)
        print("✅ เชื่อมต่อฐานข้อมูลสำเร็จ")
        return conn
    except OperationalError as e:
        print(f"❌ ไม่สามารถเชื่อมต่อฐานข้อมูลได้: {e}")
        print("\n💡 กรุณาตรวจสอบ:")
        print("   1. PostgreSQL กำลังทำงานอยู่หรือไม่")
        print("   2. ชื่อฐานข้อมูลถูกต้องหรือไม่")
        print("   3. ชื่อผู้ใช้และรหัสผ่านถูกต้องหรือไม่")
        print("   4. สิทธิ์ในการเข้าถึงฐานข้อมูล")
        sys.exit(1)
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาดที่ไม่คาดคิด: {e}")
        sys.exit(1)

def create_tables(conn):
    """สร้างตารางทั้งหมด"""
    tables_sql = """
    -- ตารางกลุ่มผู้ใช้
    CREATE TABLE IF NOT EXISTS "group_user" (
        id INTEGER PRIMARY KEY,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- ตารางกลุ่มค่าใช้จ่าย
    CREATE TABLE IF NOT EXISTS "group_cost" (
        id INTEGER PRIMARY KEY,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- ตารางกลุ่มงาน
    CREATE TABLE IF NOT EXISTS "group_work" (
        id INTEGER PRIMARY KEY,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- ตารางผู้ใช้
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name VARCHAR(100),
        group_id INTEGER REFERENCES "group_user"(id),
        username VARCHAR(100) UNIQUE,
        password VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- ตาราง logs
    CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        action VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- ตารางสินค้า
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        name VARCHAR(100),
        price DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- ตารางค่าใช้จ่าย
    CREATE TABLE IF NOT EXISTS "cost" (
        id INTEGER PRIMARY KEY,
        group_cost_id INTEGER REFERENCES "group_cost"(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        name VARCHAR(100),
        amount DECIMAL(10, 2),
        date DATE,
        status VARCHAR(20) DEFAULT 'active',
        description TEXT
    );

    -- ตารางการขาย
    CREATE TABLE IF NOT EXISTS "sales" (
        id INTEGER PRIMARY KEY,
        group_work_id INTEGER REFERENCES "group_work"(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        name VARCHAR(100),
        price DECIMAL(10, 2),
        description TEXT
    );

    -- ตารางสินค้า fostec
    CREATE TABLE IF NOT EXISTS fostec_product (
        id INTEGER PRIMARY KEY,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- ตารางงานวัด
    CREATE TABLE IF NOT EXISTS measuring_work (
        id INTEGER PRIMARY KEY,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    try:
        cursor = conn.cursor()
        print("📝 กำลังสร้างตาราง...")
        
        cursor.execute(tables_sql)
        conn.commit()
        
        print("✅ สร้างตารางทั้งหมดเรียบร้อย")
        
        # ตรวจสอบตารางที่สร้างแล้ว
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        tables = cursor.fetchall()
        
        print(f"\n📊 ตารางที่มีอยู่ในฐานข้อมูล ({len(tables)} ตาราง):")
        for table in tables:
            print(f"   ✓ {table[0]}")
            
        cursor.close()
        
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาดในการสร้างตาราง: {e}")
        conn.rollback()
        sys.exit(1)

def insert_default_data(conn):
    """แทรกข้อมูลเริ่มต้น (ถ้าจำเป็น)"""
    try:
        cursor = conn.cursor()
        print("\n📦 กำลังแทรกข้อมูลเริ่มต้น...")
        
        # ตรวจสอบว่ามีข้อมูลในตาราง group_user หรือไม่
        cursor.execute("SELECT COUNT(*) FROM \"group_user\"")
        if cursor.fetchone()[0] == 0:
            # แทรกข้อมูลกลุ่มเริ่มต้น
            default_groups = [
                (1, 'แอดมิน'),
                (2, 'ผู้จัดการ'),
                (3, 'พนักงาน')
            ]
            
            cursor.executemany(
                "INSERT INTO \"group_user\" (id, name) VALUES (%s, %s)",
                default_groups
            )
            
            # แทรกข้อมูลกลุ่มค่าใช้จ่าย
            default_cost_groups = [
                (1, 'ค่าใช้จ่ายทั่วไป'),
                (2, 'ค่าแรง'),
                (3, 'ค่าวัสดุ'),
                (4, 'ค่าใช้จ่ายอื่นๆ')
            ]
            
            cursor.executemany(
                "INSERT INTO \"group_cost\" (id, name) VALUES (%s, %s)",
                default_cost_groups
            )
            
            # แทรกข้อมูลกลุ่มงาน
            default_work_groups = [
                (1, 'งานขาย'),
                (2, 'งานบริการ'),
                (3, 'งานติดตั้ง'),
                (4, 'งานซ่อมบำรุง')
            ]
            
            cursor.executemany(
                "INSERT INTO \"group_work\" (id, name) VALUES (%s, %s)",
                default_work_groups
            )
            
            conn.commit()
            print("✅ แทรกข้อมูลเริ่มต้นเรียบร้อย")
        else:
            print("ℹ️ มีข้อมูลอยู่แล้ว ไม่ต้องแทรกข้อมูลเริ่มต้น")
            
        cursor.close()
        
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาดในการแทรกข้อมูล: {e}")
        conn.rollback()
        sys.exit(1)

def main():
    """ฟังก์ชันหลัก"""
    print("🚀 เริ่มต้นการสร้างฐานข้อมูล Internal Sale System")
    print("=" * 50)
    
    # สร้างการเชื่อมต่อ
    conn = create_connection()
    
    try:
        # สร้างตาราง
        create_tables(conn)
        
        # แทรกข้อมูลเริ่มต้น
        insert_default_data(conn)
        
        print("\n" + "=" * 50)
        print("🎉 การติดตั้งฐานข้อมูลเสร็จสมบูรณ์!")
        print("✅ พร้อมใช้งาน Internal Sale System แล้ว")
        
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาด: {e}")
        sys.exit(1)
    finally:
        if conn:
            conn.close()
            print("🔌 ปิดการเชื่อมต่อฐานข้อมูล")

if __name__ == "__main__":
    main()
