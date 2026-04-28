from fastapi import APIRouter, HTTPException

from crud.measuring_work import (
    create_product_measuring,
    get_all_measuring_work
)

router = APIRouter(
    prefix="/measuring_work",
    tags=["measuring_work"]
)

# CREATE
@router.post("/")
def create_product(id : int ,name: str):
    return create_product_measuring(id, name)

@router.get("/")
def get_all_product():
    return get_all_measuring_work()
