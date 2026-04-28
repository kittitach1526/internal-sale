from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from crud.auth import authenticate_user, create_user_token

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

# Pydantic models
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: str
    user: dict = None
    token: str = None

@router.post("/login")
def login(login_data: LoginRequest):
    """Authenticate user and return token"""
    user = authenticate_user(login_data.username, login_data.password)
    
    if user:
        token = create_user_token(user['id'])
        return {
            "success": True,
            "message": "เข้าสู่ระบบสำเร็จ",
            "user": user,
            "token": token
        }
    else:
        raise HTTPException(status_code=401, detail="อีเมลหรือรหัสผ่านไม่ถูกต้อง")

@router.post("/logout")
def logout():
    """Logout user (client-side token removal)"""
    return {
        "success": True,
        "message": "ออกจากระบบสำเร็จ"
    }
