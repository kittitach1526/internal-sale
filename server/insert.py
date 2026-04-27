import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="salesdb",
    user="postgres",
    password="yourpassword"
)

cur = conn.cursor()


def init_db():
    pass



cur.execute(
    "INSERT INTO group_users (id, name, age) VALUES (%s, %s)",
    ("John", 25)
)

conn.commit()

print("เพิ่มข้อมูลเรียบร้อย")

cur.close()
conn.close()

