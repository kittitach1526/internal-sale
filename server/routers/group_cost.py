from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from crud.group_cost import (
    create_group_cost,
    get_all_group_cost,
    delete_group_cost,
    update_group_cost
)

class GroupCostCreate(BaseModel):
    id: int
    name: str

class GroupCostUpdate(BaseModel):
    name: str

router = APIRouter(
    prefix="/group_cost",
    tags=["group_cost"]
)

# CREATE
@router.post("/")
def create_group_cost_endpoint(group_cost: GroupCostCreate):
    return create_group_cost(group_cost.id, group_cost.name)

@router.get("/")
def get_all_group_cost_endpoint():
    return get_all_group_cost()

# DELETE
@router.delete("/{group_cost_id}")
def delete_group_cost_endpoint(group_cost_id: int):
    return delete_group_cost(group_cost_id)

# UPDATE
@router.put("/{group_cost_id}")
def update_group_cost_endpoint(group_cost_id: int, group_cost: GroupCostUpdate):
    return update_group_cost(group_cost_id, group_cost.name)
