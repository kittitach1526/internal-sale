from fastapi import APIRouter
from crud.database import get_cursor

router = APIRouter(
    prefix="/group_user",
    tags=["group_user"]
)

@router.get("/")
def get_group_users():
    """Get all group users"""
    conn, cur = get_cursor(dict_mode=True)
    
    try:
        cur.execute("""
            SELECT id, name, created_at
            FROM group_user
            ORDER BY id
        """)
        
        data = cur.fetchall()
        return data
        
    except Exception as e:
        print(f"Error fetching group users: {e}")
        return []
    finally:
        cur.close()
        conn.close()
