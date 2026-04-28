from crud.database import get_cursor
import hashlib

def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hashed_password):
    """Verify password against hash"""
    return hash_password(password) == hashed_password

def authenticate_user(username, password):
    """Authenticate user by username and password"""
    conn, cur = get_cursor(dict_mode=True)
    
    try:
        cur.execute("""
            SELECT id, name, username, password, status, group_id
            FROM users
            WHERE username = %s AND status = 'active'
        """, (username,))
        
        user = cur.fetchone()
        
        if user and user['password'] == password:
            # Remove password from user data before returning
            user_data = {
                'id': user['id'],
                'name': user['name'],
                'username': user['username'],
                'group_id': user['group_id']
            }
            return user_data
        
        return None
        
    except Exception as e:
        print(f"Authentication error: {e}")
        return None
    finally:
        cur.close()
        conn.close()

def create_user_token(user_id):
    """Create a simple token for user (in production, use JWT)"""
    import secrets
    token = secrets.token_urlsafe(32)
    return token
