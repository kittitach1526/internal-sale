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

        cur.execute(
            "INSERT INTO users (id, name, group_id,username,password) VALUES (%s, %s, %s, %s, %s)",
            (0, "root", 0, "root", "energy2023")
        )

    except :
        print("Can't insert data ! e101")




def insert_user(id, name, group_id, username, password):
    try:
        cur.execute(
            "INSERT INTO users (id, name, group_id, username, password) VALUES (%s, %s, %s, %s, %s)",
            (id, name, group_id, username, password)
        )
    except:
        print("Can't insert user data ! e102")



init_db()
conn.commit()

print("เพิ่มข้อมูลเรียบร้อย")

cur.close()
conn.close()

