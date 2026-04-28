from crud.database import get_cursor

def get_all_types():
    conn, cur = get_cursor(dict_mode=True)
    
    cur.execute("""
        SELECT pt.id, pt.name, pt.description, pt.created_at, pt.status,
               pc.name as category_name, pc.id as category_id
        FROM product_type pt
        LEFT JOIN product_category pc ON pt.category_id = pc.id
        WHERE pt.status = 'active' AND pc.status = 'active'
        ORDER BY pc.name, pt.name;
    """)
    
    data = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return data

def get_types_by_category(category_id):
    conn, cur = get_cursor(dict_mode=True)
    
    cur.execute("""
        SELECT id, name, description, created_at, status
        FROM product_type
        WHERE category_id = %s AND status = 'active'
        ORDER BY name;
    """, (category_id,))
    
    data = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return data

def get_type_by_id(type_id):
    conn, cur = get_cursor(dict_mode=True)
    
    cur.execute("""
        SELECT pt.id, pt.name, pt.description, pt.created_at, pt.status,
               pc.name as category_name, pc.id as category_id
        FROM product_type pt
        LEFT JOIN product_category pc ON pt.category_id = pc.id
        WHERE pt.id = %s AND pt.status = 'active';
    """, (type_id,))
    
    data = cur.fetchone()
    
    cur.close()
    conn.close()
    
    return data

def create_type(category_id, name, description=None):
    conn, cur = get_cursor()
    
    cur.execute("""
        INSERT INTO product_type (category_id, name, description)
        VALUES (%s, %s, %s)
        RETURNING id, category_id, name, description, created_at, status;
    """, (category_id, name, description))
    
    data = cur.fetchone()
    conn.commit()
    
    cur.close()
    conn.close()
    
    return data

def update_type(type_id, category_id=None, name=None, description=None):
    conn, cur = get_cursor()
    
    # Build dynamic update query
    update_fields = []
    values = []
    
    if category_id is not None:
        update_fields.append("category_id = %s")
        values.append(category_id)
    
    if name is not None:
        update_fields.append("name = %s")
        values.append(name)
    
    if description is not None:
        update_fields.append("description = %s")
        values.append(description)
    
    if not update_fields:
        raise ValueError("No fields to update")
    
    values.append(type_id)
    
    cur.execute(f"""
        UPDATE product_type
        SET {', '.join(update_fields)}
        WHERE id = %s
        RETURNING id, category_id, name, description, created_at, status;
    """, values)
    
    data = cur.fetchone()
    conn.commit()
    
    cur.close()
    conn.close()
    
    return data

def delete_type(type_id):
    conn, cur = get_cursor()
    
    cur.execute("""
        UPDATE product_type
        SET status = 'inactive'
        WHERE id = %s
        RETURNING id;
    """, (type_id,))
    
    data = cur.fetchone()
    conn.commit()
    
    cur.close()
    conn.close()
    
    return data
