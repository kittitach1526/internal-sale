from .database import *

def create_group_cost(id, name):
    conn, cur = get_cursor(dict_mode=True)
    try :
        cur.execute("INSERT INTO group_cost (id, name) VALUES (%s, %s);", (id, name))
        conn.commit()
        return True
    except Exception as e:
        print(e)
        return False
    finally:
        cur.close()
        conn.close()

def get_all_group_cost():
    conn, cur = get_cursor(dict_mode=True)

    cur.execute("""
        SELECT id, name, created_at
        FROM group_cost;
    """)

    data = cur.fetchall()

    cur.close()
    conn.close()

    return data

def delete_group_cost(group_cost_id):
    conn, cur = get_cursor(dict_mode=True)
    try:
        cur.execute("DELETE FROM group_cost WHERE id = %s;", (group_cost_id,))
        conn.commit()
    except Exception as e:
        print(e)
        return False
    finally:
        cur.close()
        conn.close()

    return True

def update_group_cost(group_cost_id, name):
    conn, cur = get_cursor(dict_mode=True)
    try:
        cur.execute("UPDATE group_cost SET name = %s WHERE id = %s;", (name, group_cost_id))
        conn.commit()
        return True
    except Exception as e:
        print(e)
        return False
    finally:
        cur.close()
        conn.close()