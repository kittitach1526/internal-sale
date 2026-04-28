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
        SELECT id, name, category, product_type, created_at, status
        FROM fostec_product
        WHERE status = 'active';
    """)

    data = cur.fetchall()

    cur.close()
    conn.close()

    return data

def delete_product_fostec(product_id):
    conn, cur = get_cursor(dict_mode=True)
    try:
        cur.execute("UPDATE fostec_product SET status = 'inactive' WHERE id = %s;", (product_id,))
        conn.commit()
    except Exception as e:
        print(e)
        return False
    finally:
        cur.close()
        conn.close()

    return True

def get_fostec_product_categories():
    conn, cur = get_cursor(dict_mode=True)

    cur.execute("""
        SELECT DISTINCT category
        FROM fostec_product
        WHERE status = 'active' AND category IS NOT NULL AND category != ''
        ORDER BY category;
    """)

    data = cur.fetchall()
    categories = [row['category'] for row in data]

    cur.close()
    conn.close()

    return categories

def get_fostec_product_types_by_category(category):
    conn, cur = get_cursor(dict_mode=True)

    cur.execute("""
        SELECT DISTINCT product_type
        FROM fostec_product
        WHERE status = 'active' AND category = %s AND product_type IS NOT NULL AND product_type != ''
        ORDER BY product_type;
    """, (category,))

    data = cur.fetchall()
    types = [row['product_type'] for row in data]

    cur.close()
    conn.close()

    return types