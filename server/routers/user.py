from fastapi import APIRouter, HTTPException

from crud.user import (
    create_user_db,
    get_all_user_db,
    get_user_db,
    update_user_db,
    delete_user_db
)

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

# CREATE
@router.post("/")
def create_user(id : int ,name: str, username: str,password :str ,group_user : int):
    return create_user_db(id, name, username, password, group_user)

# READ ALL
@router.get("/")
def get_users():
    return get_all_user_db()

# READ ONE
@router.get("/{user_name}")
def get_user(user_name: str):
    user = get_user_db(user_name)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# UPDATE
@router.put("/{user_id}")
def update_user(user_id: int, name: str, email: str, role: str):
    updated = update_user_db(user_id, name, email, role)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Updated"}

# DELETE
@router.delete("/{user_id}")
def delete_user(user_id: int):
    deleted = delete_user_db(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Deleted"}