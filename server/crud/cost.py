from .database import *

def create_cost(group_cost_id, description, amount, date, note):
    conn, cur = get_cursor(dict_mode=True)
    try:
        cur.execute("""
            INSERT INTO cost (group_cost_id, name, price, description, created_at)
            VALUES (%s, %s, %s, %s, %s);
        """, (group_cost_id, description, int(amount), note or "", date))
        conn.commit()
        return True
    except Exception as e:
        print(e)
        return False
    finally:
        cur.close()
        conn.close()

def get_all_costs():
    conn, cur = get_cursor(dict_mode=True)
    
    cur.execute("""
        SELECT c.id, c.group_cost_id, c.name as description, c.price as amount, c.created_at as date, 
               c.description as note, c.created_at,
               gc.name as category_name
        FROM cost c
        LEFT JOIN group_cost gc ON c.group_cost_id = gc.id
        WHERE c.status = 'active'
        ORDER BY c.created_at DESC;
    """)
    
    data = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return data

def get_costs_by_category(group_cost_id):
    conn, cur = get_cursor(dict_mode=True)
    
    cur.execute("""
        SELECT c.id, c.group_cost_id, c.name as description, c.price as amount, c.created_at as date,
               c.description as note, c.created_at,
               gc.name as category_name
        FROM cost c
        LEFT JOIN group_cost gc ON c.group_cost_id = gc.id
        WHERE c.group_cost_id = %s AND c.status = 'active'
        ORDER BY c.created_at DESC;
    """, (group_cost_id,))
    
    data = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return data

def update_cost(cost_id, description, amount, date, note):
    conn, cur = get_cursor(dict_mode=True)
    try:
        cur.execute("""
            UPDATE cost 
            SET name = %s, price = %s, description = %s, created_at = %s
            WHERE id = %s;
        """, (description, int(amount), note or "", date, cost_id))
        conn.commit()
        return True
    except Exception as e:
        print(e)
        return False
    finally:
        cur.close()
        conn.close()

def delete_cost(cost_id):
    conn, cur = get_cursor(dict_mode=True)
    try:
        cur.execute("UPDATE cost SET status = 'inactive' WHERE id = %s;", (cost_id,))
        conn.commit()
        return True
    except Exception as e:
        print(e)
        return False
    finally:
        cur.close()
        conn.close()
