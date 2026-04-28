from fastapi import APIRouter, HTTPException

from crud.group_cost import (
    create_group_cost,
    get_all_group_cost,
    delete_group_cost,
    update_group_cost
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

# DELETE
@router.delete("/{group_cost_id}")
def delete_group_cost_endpoint(group_cost_id: int):
    return delete_group_cost(group_cost_id)

# UPDATE
@router.put("/{group_cost_id}")
def update_group_cost_endpoint(group_cost_id: int, name: str):
    return update_group_cost(group_cost_id, name)
