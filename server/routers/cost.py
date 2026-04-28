from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import date

from crud.cost import (
    create_cost,
    get_all_costs,
    get_costs_by_category,
    update_cost,
    delete_cost
)

router = APIRouter(
    prefix="/cost",
    tags=["cost"]
)

class CostCreate(BaseModel):
    group_cost_id: int
    description: str
    amount: float
    date: str
    note: str = ""

class CostUpdate(BaseModel):
    description: str
    amount: float
    date: str
    note: str = ""

# CREATE
@router.post("/")
def create_cost_endpoint(cost: CostCreate):
    return create_cost(cost.group_cost_id, cost.description, cost.amount, cost.date, cost.note)

# GET all costs
@router.get("/")
def get_costs():
    return get_all_costs()

# GET cost statistics by period
@router.get("/stats/{period}")
def get_cost_stats(period: str):
    """Get cost statistics by period (daily, monthly, quarterly, yearly)"""
    return get_cost_statistics(period)

# GET cost by ID
@router.get("/{cost_id}")
def get_cost(cost_id: int):
    cost = get_cost_by_id(cost_id)
    if not cost:
        raise HTTPException(status_code=404, detail="Cost not found")
    return cost

# GET BY CATEGORY
@router.get("/category/{group_cost_id}")
def get_costs_by_category_endpoint(group_cost_id: int):
    return get_costs_by_category(group_cost_id)

# UPDATE
@router.put("/{cost_id}")
def update_cost_endpoint(cost_id: int, cost: CostUpdate):
    return update_cost(cost_id, cost.description, cost.amount, cost.date, cost.note)

# DELETE
@router.delete("/{cost_id}")
def delete_cost_endpoint(cost_id: int):
    return delete_cost(cost_id)
