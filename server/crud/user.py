from .database import get_conn, get_cursor

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

def update_user_db(user_id, name, email, role):
    conn, cur = get_cursor(dict_mode=True)
    try:
        # Convert role to group_id
        group_id = 2 if role == 'manager' else 1 if role == 'admin' else 3
        cur.execute("UPDATE users SET name = %s, email = %s, group_id = %s WHERE id = %s AND status = 'active';", 
                   (name, email, group_id, user_id))
        conn.commit()
        return True
    except Exception as e:
        print(e)
        return False
    finally:
        cur.close()
        conn.close()

def delete_user_db(user_id):
    conn = get_conn()
    cur = conn.cursor()
    try:
        # First check if user exists and is active
        cur.execute("SELECT id FROM users WHERE id = %s AND status = 'active';", (user_id,))
        user_exists = cur.fetchone()
        
        print(f"Debug: Checking user ID {user_id}, exists: {user_exists}")
        
        if not user_exists:
            print(f"Debug: User {user_id} not found or not active")
            return False
            
        # Update user status to inactive
        cur.execute("UPDATE users SET status = 'inactive' WHERE id = %s;", (user_id,))
        conn.commit()
        print(f"Debug: Successfully updated user {user_id} to inactive")
        return True
    except Exception as e:
        print(f"Debug: Error in delete_user_db: {e}")
        return False
    finally:
        cur.close()
        conn.close()