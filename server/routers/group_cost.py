from fastapi import APIRouter, HTTPException

from crud.group_cost import (
    create_group_cost,
    get_all_group_cost
)

router = APIRouter(
    prefix="/group_cost",
    tags=["group_cost"]
)

# CREATE
@router.post("/")
def create_group_cost_endpoint(id : int ,name: str):
    return create_group_cost(id, name)

@router.get("/")
def get_all_group_cost_endpoint():
    return get_all_group_cost()
