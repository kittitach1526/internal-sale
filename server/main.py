import psycopg2

try:
    conn = psycopg2.connect(
        host="localhost",
        database="sale-internal",
        user="postgres",
        password="energy2023",
        port="5432"
    )

    print("เชื่อมต่อสำเร็จ")

    cur = conn.cursor()
    cur.execute("SELECT version();")

    db_version = cur.fetchone()
    print("PostgreSQL version:", db_version)

    cur.close()
    conn.close()

except Exception as e:
    print("เกิดข้อผิดพลาด:", e)