from fastapi import APIRouter, HTTPException

from crud.fostec_product import (
    create_product_fostec,
    # get_all_product_fostec,
    # get_product_fostec,
    # update_product_fostec,
    # delete_product_fostec
)

router = APIRouter(
    prefix="/fostec_product",
    tags=["fostec_product"]
)

# CREATE
@router.post("/")
def create_product(id : int ,name: str):
    return create_product_fostec(id, name)

# # READ ALL
# @router.get("/")
# def get_users():
#     return get_all_user_db()

# # # READ ONE
# # @router.get("/{user_name}")
# # def get_user(user_name: str):
# #     user = get_user_db(user_name)
# #     if not user:
# #         raise HTTPException(status_code=404, detail="User not found")
# #     return user

# # DELETE
# @router.delete("/{user_id}")
# def delete_user(user_id: int):
#     deleted = delete_user_db(user_id)
#     if not deleted:
#         raise HTTPException(status_code=404, detail="User not found")
#     return {"message": "Deleted"}