import psycopg2

try:
    # กำหนดค่าการเชื่อมต่อ
    connection = psycopg2.connect(
        user="my_user",
        password="my_password",
        host="192.168.1.206", # IP ของ Ubuntu Server
        port="5432",
        database="my_project"
    )

    cursor = connection.cursor()
    
    # ทดสอบรันคำสั่ง SQL
    cursor.execute("SELECT version();")
    record = cursor.fetchone()
    print("เชื่อมต่อสำเร็จ:", record)

except (Exception, psycopg2.Error) as error:
    print("เกิดข้อผิดพลาดในการเชื่อมต่อ:", error)

finally:
    if connection:
        cursor.close()
        connection.close()
        print("ปิดการเชื่อมต่อแล้ว")