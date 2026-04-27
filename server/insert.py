import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="salesdb",
    user="postgres",
    password="energy2023"
)

cur = conn.cursor()


def init_db():

    try : 
        cur.execute(
        "INSERT INTO group_user (id, name) VALUES (%s, %s)",
        (1, "Admin")
        )
        
        cur.execute(
        "INSERT INTO group_user (id, name) VALUES (%s, %s)",
        (2, "User")
        )
        
        cur.execute(
        "INSERT INTO group_user (id, name) VALUES (%s, %s)",
        (3, "Viewer")
        )
        
        cur.execute(
        "INSERT INTO group_user (id, name) VALUES (%s, %s)",
        (0, "root")
        )
    except :
        print("Can't insert data ! e101")



init_db()
conn.commit()

print("เพิ่มข้อมูลเรียบร้อย")

cur.close()
conn.close()

