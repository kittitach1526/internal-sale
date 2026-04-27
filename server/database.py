import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="salesdb",
    user="postgres",
    password="energy2023"
)

cur = conn.cursor()