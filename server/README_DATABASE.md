# Database Initialization Guide

## การติดตั้งฐานข้อมูล Internal Sale System

### วิธีที่ 1: รันสคริปต์โดยตรง (แนะนำ)

```bash
cd server
python init_database.py
```

### วิธีที่ 2: ตั้งค่า Environment Variables ก่อนรัน

```bash
# ตั้งค่า Environment Variables
export DB_HOST=localhost
export DB_NAME=salesdb
export DB_USER=postgres
export DB_PASSWORD=your_password
export DB_PORT=5432

# รันสคริปต์
python init_database.py
```

### วิธีที่ 3: สร้างไฟล์ .env

สร้างไฟล์ `.env` ในโฟลเดอร์ `server`:

```env
DB_HOST=localhost
DB_NAME=salesdb
DB_USER=postgres
DB_PASSWORD=your_password
DB_PORT=5432
```

จากนั้นรัน:
```bash
cd server
python init_database.py
```

## คำอธิบายตาราง

### ตารางหลัก
- **users** - ข้อมูลผู้ใช้
- **sales** - ข้อมูลการขาย
- **cost** - ข้อมูลค่าใช้จ่าย
- **products** - ข้อมูลสินค้า

### ตารางกลุ่ม (Groups)
- **group_user** - กลุ่มผู้ใช้ (แอดมิน, ผู้จัดการ, พนักงาน)
- **group_cost** - กลุ่มค่าใช้จ่าย (ทั่วไป, ค่าแรง, ค่าวัสดุ, อื่นๆ)
- **group_work** - กลุ่มงาน (ขาย, บริการ, ติดตั้ง, ซ่อมบำรุง)

### ตารางอื่นๆ
- **logs** - บันทึกการทำงาน
- **fostec_product** - สินค้า Fostec
- **measuring_work** - งานวัด

## การตรวจสอบหลังการติดตั้ง

หลังจากรันสคริปต์เสร็จ คุณสามารถตรวจสอบได้:

```sql
-- ตรวจสอบตารางทั้งหมด
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ตรวจสอบข้อมูลเริ่มต้น
SELECT * FROM "group_user";
SELECT * FROM "group_cost";
SELECT * FROM "group_work";
```

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **ไม่สามารถเชื่อมต่อฐานข้อมูลได้**
   - ตรวจสอบว่า PostgreSQL กำลังทำงานอยู่
   - ตรวจสอบชื่อฐานข้อมูล ผู้ใช้ รหัสผ่าน
   - ตรวจสอบสิทธิ์ในการเข้าถึง

2. **ฐานข้อมูลไม่มีอยู่**
   ```sql
   CREATE DATABASE salesdb;
   ```

3. **Port ไม่ถูกต้อง**
   - ตรวจสอบว่า PostgreSQL ทำงานที่ port 5432 หรือไม่
   - แก้ไขใน environment variable: `DB_PORT=5432`

## การใช้งานร่วมกับ Application

หลังจากติดตั้งฐานข้อมูลเสร็จ ให้:

1. ตรวจสอบว่า FastAPI backend สามารถเชื่อมต่อได้
2. รัน FastAPI server: `uvicorn main:app --reload`
3. เปิดหน้าเว็บ: `http://localhost:8000`

## การสำรองข้อมูล (Backup)

```bash
# สำรองข้อมูล
pg_dump -h localhost -U postgres -d salesdb > backup.sql

# กู้คืนข้อมูล
psql -h localhost -U postgres -d salesdb < backup.sql
```

---

📝 **หมายเหตุ**: สคริปต์นี้ออกแบบมาให้ใช้งานง่ายและพกพาสะดวก สามารถนำไปรันบนเครื่องใดๆ ก็ได้ที่มี PostgreSQL ติดตั้งอยู่
