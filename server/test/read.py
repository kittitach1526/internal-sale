import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="salesdb",
    user="postgres",
    password="energy2023"
)

cur = conn.cursor()

cur.execute("SELECT * FROM users;")
rows = cur.fetchall()

for row in rows:
    print(row)

cur.close()
conn.close()