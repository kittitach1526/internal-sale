from fastapi import APIRouter, HTTPException

from crud.fostec_product import (
    create_product_fostec,
    get_all_product_fostec,
    get_fostec_product_categories,
    get_fostec_product_types_by_category,
    delete_product_fostec
)

router = APIRouter(
    prefix="/fostec_product",
    tags=["fostec_product"]
)

# CREATE
@router.post("/")
def create_product(id : int ,name: str):
    return create_product_fostec(id, name)

@router.get("/")
def get_all_product():
    return get_all_product_fostec()

# GET categories
@router.get("/categories")
def get_categories():
    return get_fostec_product_categories()

# GET types by category
@router.get("/types/{category}")
def get_types_by_category(category: str):
    return get_fostec_product_types_by_category(category)

# DELETE
@router.delete("/{id}")
def delete_product(id: int):
    return delete_product_fostec(id)
