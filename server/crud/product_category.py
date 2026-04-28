from crud.database import get_cursor

def get_all_categories():
    conn, cur = get_cursor(dict_mode=True)
    
    cur.execute("""
        SELECT id, name, description, created_at, status
        FROM product_category
        WHERE status = 'active'
        ORDER BY name;
    """)
    
    data = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return data

def get_category_by_id(category_id):
    conn, cur = get_cursor(dict_mode=True)
    
    cur.execute("""
        SELECT id, name, description, created_at, status
        FROM product_category
        WHERE id = %s AND status = 'active';
    """, (category_id,))
    
    data = cur.fetchone()
    
    cur.close()
    conn.close()
    
    return data

def create_category(name, description=None):
    conn, cur = get_cursor()
    
    cur.execute("""
        INSERT INTO product_category (name, description)
        VALUES (%s, %s)
        RETURNING id, name, description, created_at, status;
    """, (name, description))
    
    data = cur.fetchone()
    conn.commit()
    
    cur.close()
    conn.close()
    
    return data

def update_category(category_id, name=None, description=None):
    conn, cur = get_cursor()
    
    # Build dynamic update query
    update_fields = []
    values = []
    
    if name is not None:
        update_fields.append("name = %s")
        values.append(name)
    
    if description is not None:
        update_fields.append("description = %s")
        values.append(description)
    
    if not update_fields:
        raise ValueError("No fields to update")
    
    values.append(category_id)
    
    cur.execute(f"""
        UPDATE product_category
        SET {', '.join(update_fields)}
        WHERE id = %s
        RETURNING id, name, description, created_at, status;
    """, values)
    
    data = cur.fetchone()
    conn.commit()
    
    cur.close()
    conn.close()
    
    return data

def delete_category(category_id):
    conn, cur = get_cursor()
    
    cur.execute("""
        UPDATE product_category
        SET status = 'inactive'
        WHERE id = %s
        RETURNING id;
    """, (category_id,))
    
    data = cur.fetchone()
    conn.commit()
    
    cur.close()
    conn.close()
    
    return data
