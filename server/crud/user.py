from .database import *

def create_user_db(id, name, username, password, group_user):
    conn, cur = get_cursor(dict_mode=True)
    try :
        cur.execute("INSERT INTO users (id, name, username, password, group_id) VALUES (%s, %s, %s, %s, %s);", (id, name, username, password, group_user))
        conn.commit()
        return True
    except Exception as e:
        print(e)
        return False
    finally:
        cur.close()
        conn.close()

def get_all_user_db():
    conn, cur = get_cursor(dict_mode=True)

    cur.execute("""
        SELECT id, username, name, group_id, created_at, status
        FROM users
        WHERE status = 'active';
    """)

    data = cur.fetchall()

    cur.close()
    conn.close()

    return data

def get_user_db(user_name):
    conn, cur = get_cursor(dict_mode=True)

    cur.execute("SELECT * FROM users where username = %s AND status = 'active';", (user_name,))
    data = cur.fetchall()

    cur.close()
    conn.close()

    return data

def update_user_db(user_name, name, age):
    return True

def delete_user_db(user_name):
    conn, cur = get_cursor(dict_mode=True)
    try:
        cur.execute("UPDATE users SET status = 'inactive' WHERE username = %s;", (user_name,))
        conn.commit()
    except Exception as e:
        print(e)
        return False
    finally:
        cur.close()
        conn.close()

    return True