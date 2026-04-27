from .database import *

def create_product_fostec(id, name):
    conn, cur = get_cursor(dict_mode=True)
    try :
        cur.execute("INSERT INTO fostec_product (id, name) VALUES (%s, %s);", (id, name))
        conn.commit()
        return True
    except Exception as e:
        print(e)
        return False
    finally:
        cur.close()
        conn.close()

def get_all_product_fostec():
    conn, cur = get_cursor(dict_mode=True)

    cur.execute("""
        SELECT id, name, created_at
        FROM fostec_product;
    """)

    data = cur.fetchall()

    cur.close()
    conn.close()

    return data

def delete_product_fostec(product_id):
    conn, cur = get_cursor(dict_mode=True)
    try:
        cur.execute("DELETE FROM fostec_product WHERE id = %s;", (product_id,))
        conn.commit()
    except Exception as e:
        print(e)
        return False
    finally:
        cur.close()
        conn.close()

    return True