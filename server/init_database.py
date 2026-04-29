#!/usr/bin/env python3
"""
Internal Sale System - Database Initialization
สคริปต์สำหรับสร้างฐานข้อมูล PostgreSQL ทั้งหมด
ใช้สำหรับติดตั้งระบบครั้งแรก

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
from datetime import datetime

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', '192.168.100.206'),
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
        print("\n🔧 คำสั่งสร้างฐานข้อมูล:")
        print(f"   CREATE DATABASE {DB_CONFIG['database']};")
        print(f"   CREATE USER {DB_CONFIG['user']} WITH PASSWORD '{DB_CONFIG['password']}';")
        print(f"   GRANT ALL PRIVILEGES ON DATABASE {DB_CONFIG['database']} TO {DB_CONFIG['user']};")
        sys.exit(1)

def create_tables(conn):
    """สร้างตารางทั้งหมด"""
    print("\n📋 กำลังสร้างตาราง...")
    
    cursor = conn.cursor()
    
    # สร้างตารางต่างๆ
    tables_sql = """
    -- ตารางกลุ่มผู้ใช้
    CREATE TABLE IF NOT EXISTS "group_user" (
        id INTEGER PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- ตารางกลุ่มค่าใช้จ่าย
    CREATE TABLE IF NOT EXISTS "group_cost" (
        id INTEGER PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- ตารางกลุ่มงาน
    CREATE TABLE IF NOT EXISTS "group_work" (
        id INTEGER PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- ตารางผู้ใช้
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        group_id INTEGER REFERENCES "group_user"(id),
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- ตาราง logs สำหรับบันทึกกิจกรรม
    CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- ตารางหมวดหมู่สินค้า
    CREATE TABLE IF NOT EXISTS product_category (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- ตารางประเภทสินค้า
    CREATE TABLE IF NOT EXISTS product_type (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        category_id INTEGER REFERENCES product_category(id),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- ตารางสินค้า Fostec
    CREATE TABLE IF NOT EXISTS fostec_product (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- ตารางงานตรวจวัด
    CREATE TABLE IF NOT EXISTS measuring_work (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- ตารางค่าใช้จ่าย
    CREATE TABLE IF NOT EXISTS "cost" (
        id SERIAL PRIMARY KEY,
        group_cost_id INTEGER REFERENCES "group_cost"(id),
        name VARCHAR(100) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT,
        date DATE,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- ตารางการขาย
    CREATE TABLE IF NOT EXISTS "sales" (
        id SERIAL PRIMARY KEY,
        group_work_id INTEGER REFERENCES "group_work"(id),
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    try:
        cursor.execute(tables_sql)
        conn.commit()
        print("✅ สร้างตารางทั้งหมดเรียบร้อย")
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาดในการสร้างตาราง: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        cursor.close()

def insert_default_data(conn):
    """แทรกข้อมูลเริ่มต้น"""
    print("\n📝 กำลังแทรกข้อมูลเริ่มต้น...")
    
    cursor = conn.cursor()
    
    try:
        # ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
        cursor.execute("SELECT COUNT(*) FROM \"group_user\"")
        if cursor.fetchone()[0] > 0:
            print("ℹ️ มีข้อมูลอยู่แล้ว ไม่ต้องแทรกข้อมูลเริ่มต้น")
            return
        
        # แทรกข้อมูลกลุ่มผู้ใช้
        default_user_groups = [
            (1, 'Admin'),
            (2, 'Manager'),
            (3, 'Employee'),
            (4, 'Guest')
        ]
        
        cursor.executemany(
            "INSERT INTO \"group_user\" (id, name) VALUES (%s, %s)",
            default_user_groups
        )
        
        # แทรกข้อมูลกลุ่มค่าใช้จ่าย
        default_cost_groups = [
            (1, 'ค่าใช้จ่ายทั่วไป'),
            (2, 'ค่าอาหาร'),
            (3, 'ค่าเดินทาง'),
            (4, 'ค่าสื่อสาร'),
            (5, 'ค่าสำนักงาน'),
            (6, 'ค่าตลาด'),
            (7, 'ค่าบำรุงรักษา'),
            (8, 'ค่าอื่นๆ')
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
        
        # แทรกข้อมูลหมวดหมู่สินค้า
        default_categories = [
            (1, 'อุปกรณ์อิเล็กทรอนิกส์', 'อุปกรณ์และเครื่องใช้ไฟฟ้า'),
            (2, 'เฟอร์นิเจอร์', 'เฟอร์นิเจอร์สำนักงานและบ้าน'),
            (3, 'วัสดุก่อสร้าง', 'วัสดุและอุปกรณ์ก่อสร้าง'),
            (4, 'บริการ', 'บริการต่างๆ')
        ]
        
        cursor.executemany(
            "INSERT INTO product_category (id, name, description) VALUES (%s, %s, %s)",
            default_categories
        )
        
        # แทรกข้อมูลประเภทสินค้า
        default_types = [
            (1, 'คอมพิวเตอร์', 'คอมพิวเตอร์และอุปกรณ์ต่อพ่วง', 1),
            (2, 'โทรศัพท์', 'โทรศัพท์มือถือและอุปกรณ์', 1),
            (3, 'โต๊ะ', 'โต๊ะทำงานและโต๊ะสนทนา', 2),
            (4, 'เก้าอี้', 'เก้าอี้สำนักงานและเก้าอี้นั่ง', 2),
            (5, 'ปูน', 'ปูนซีเมนต์และวัสดุผสม', 3),
            (6, 'เหล็ก', 'เหล็กและเกรดไฟ', 3),
            (7, 'ติดตั้ง', 'บริการติดตั้งอุปกรณ์', 4),
            (8, 'ซ่อม', 'บริการซ่อมบำรุง', 4)
        ]
        
        cursor.executemany(
            "INSERT INTO product_type (id, name, description, category_id) VALUES (%s, %s, %s, %s)",
            default_types
        )
        
        # แทรกข้อมูลสินค้า Fostec
        default_fostec_products = [
            (1, 'Fostec X100', 'เครื่องวัดความดันรุ่น X100'),
            (2, 'Fostec Y200', 'เครื่องวัดอุณหภูมิรุ่น Y200'),
            (3, 'Fostec Z300', 'เครื่องวัดความชื้นรุ่น Z300'),
            (4, 'Fostec W400', 'เครื่องวัดน้ำหนักรุ่น W400')
        ]
        
        cursor.executemany(
            "INSERT INTO fostec_product (id, name, description) VALUES (%s, %s, %s)",
            default_fostec_products
        )
        
        # แทรกข้อมูลงานตรวจวัด
        default_measuring_works = [
            (1, 'ตรวจวัดไฟฟ้า', 'ตรวจวัดระบบไฟฟ้า'),
            (2, 'ตรวจวัดประปา', 'ตรวจวัดระบบประปา'),
            (3, 'ตรวจวัดแอร์', 'ตรวจวัดระบบแอร์'),
            (4, 'ตรวจวัดโครงสร้าง', 'ตรวจวัดโครงสร้างอาคาร')
        ]
        
        cursor.executemany(
            "INSERT INTO measuring_work (id, name, description) VALUES (%s, %s, %s)",
            default_measuring_works
        )
        
        # แทรกผู้ใช้ admin (รหัสผ่าน: admin123)
        cursor.execute("""
            INSERT INTO users (name, username, password, group_id) 
            VALUES (%s, %s, %s, %s)
        """, ('Administrator', 'admin', 'admin123', 1))
        
        conn.commit()
        print("✅ แทรกข้อมูลเริ่มต้นเรียบร้อย")
        
        # แสดงข้อมูลที่แทรก
        print("\n📊 ข้อมูลที่แทรก:")
        print(f"   กลุ่มผู้ใช้: {len(default_user_groups)} รายการ")
        print(f"   กลุ่มค่าใช้จ่าย: {len(default_cost_groups)} รายการ")
        print(f"   กลุ่มงาน: {len(default_work_groups)} รายการ")
        print(f"   หมวดหมู่สินค้า: {len(default_categories)} รายการ")
        print(f"   ประเภทสินค้า: {len(default_types)} รายการ")
        print(f"   สินค้า Fostec: {len(default_fostec_products)} รายการ")
        print(f"   งานตรวจวัด: {len(default_measuring_works)} รายการ")
        print(f"   ผู้ใช้: 1 รายการ (admin/admin123)")
        
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาดในการแทรกข้อมูล: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        cursor.close()

def create_indexes(conn):
    """สร้างดัชนีเพื่อเพิ่มประสิทธิภาพ"""
    print("\n🔍 กำลังสร้างดัชนี...")
    
    cursor = conn.cursor()
    
    indexes_sql = """
    -- ดัชนีสำหรับตาราง users
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
    
    -- ดัชนีสำหรับตาราง logs
    CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_logs_action ON logs(action);
    
    -- ดัชนีสำหรับตาราง sales
    CREATE INDEX IF NOT EXISTS idx_sales_group_work_id ON sales(group_work_id);
    CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
    CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
    
    -- ดัชนีสำหรับตาราง cost
    CREATE INDEX IF NOT EXISTS idx_cost_group_cost_id ON cost(group_cost_id);
    CREATE INDEX IF NOT EXISTS idx_cost_created_at ON cost(created_at);
    CREATE INDEX IF NOT EXISTS idx_cost_status ON cost(status);
    CREATE INDEX IF NOT EXISTS idx_cost_date ON cost(date);
    
    -- ดัชนีสำหรับตารางอื่นๆ
    CREATE INDEX IF NOT EXISTS idx_product_category_status ON product_category(status);
    CREATE INDEX IF NOT EXISTS idx_product_type_status ON product_type(status);
    CREATE INDEX IF NOT EXISTS idx_fostec_product_status ON fostec_product(status);
    CREATE INDEX IF NOT EXISTS idx_measuring_work_status ON measuring_work(status);
    """
    
    try:
        cursor.execute(indexes_sql)
        conn.commit()
        print("✅ สร้างดัชนีทั้งหมดเรียบร้อย")
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาดในการสร้างดัชนี: {e}")
        conn.rollback()
    finally:
        cursor.close()

def verify_database(conn):
    """ตรวจสอบฐานข้อมูลหลังการสร้าง"""
    print("\n🔍 กำลังตรวจสอบฐานข้อมูล...")
    
    cursor = conn.cursor()
    
    try:
        # ตรวจสอบตารางทั้งหมด
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = [row[0] for row in cursor.fetchall()]
        
        print(f"✅ ตารางทั้งหมด ({len(tables)} ตาราง):")
        for table in tables:
            print(f"   - {table}")
        
        # ตรวจสอบจำนวนข้อมูลในแต่ละตาราง
        print("\n📊 จำนวนข้อมูลในตาราง:")
        for table in ['users', 'logs', 'sales', 'cost', 'group_user', 'group_cost', 'group_work']:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"   {table}: {count} รายการ")
        
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาดในการตรวจสอบ: {e}")
    finally:
        cursor.close()

def main():
    """ฟังก์ชันหลัก"""
    print("🚀 Internal Sale System - Database Initialization")
    print("=" * 60)
    print(f"⏰ เวลา: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # สร้างการเชื่อมต่อ
    conn = create_connection()
    
    try:
        # สร้างตาราง
        create_tables(conn)
        
        # แทรกข้อมูลเริ่มต้น
        insert_default_data(conn)
        
        # สร้างดัชนี
        create_indexes(conn)
        
        # ตรวจสอบฐานข้อมูล
        verify_database(conn)
        
        print("\n" + "=" * 60)
        print("🎉 การติดตั้งฐานข้อมูลเสร็จสมบูรณ์!")
        print("✅ พร้อมใช้งาน Internal Sale System แล้ว")
        print()
        print("🔑 ข้อมูลเข้าใช้งาน:")
        print("   Username: admin")
        print("   Password: admin123")
        print()
        print("🌐 สามารถเริ่มต้นเซิร์ฟเวอร์:")
        print("   python server.py")
        print("   หรือ")
        print("   uvicorn server:app --host 0.0.0.0 --port 8000")
        
    except Exception as e:
        print(f"\n❌ เกิดข้อผิดพลาด: {e}")
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    main()
