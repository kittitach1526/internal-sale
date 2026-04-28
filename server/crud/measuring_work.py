from .database import *

def create_product_measuring(id, name):
    conn, cur = get_cursor(dict_mode=True)
    try :
        cur.execute("INSERT INTO measuring_work (id, name) VALUES (%s, %s);", (id, name))
        conn.commit()
        return True
    except Exception as e:
        print(e)
        return False
    finally:
        cur.close()
        conn.close()

def get_all_measuring_work():
    conn, cur = get_cursor(dict_mode=True)

    cur.execute("""
        SELECT id, name, created_at, status
        FROM measuring_work
        WHERE status = 'active';
    """)

    data = cur.fetchall()

    cur.close()
    conn.close()

    return data

def delete_product_measuring(product_id):
    conn, cur = get_cursor(dict_mode=True)
    try:
        cur.execute("UPDATE measuring_work SET status = 'inactive' WHERE id = %s;", (product_id,))
        conn.commit()
    except Exception as e:
        print(e)
        return False
    finally:
        cur.close()
        conn.close()

    return True