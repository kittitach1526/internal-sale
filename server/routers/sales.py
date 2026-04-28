from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import date

from crud.sales import (
    create_sales,
    get_all_sales,
    get_sales_by_group_work,
    update_sales,
    delete_sales,
    get_sales_statistics,
    get_monthly_sales_data
)

router = APIRouter(
    prefix="/sales",
    tags=["sales"]
)

class SalesCreate(BaseModel):
    group_work_id: int
    name: str
    price: float
    description: str = ""

class SalesUpdate(BaseModel):
    group_work_id: int
    name: str
    price: float
    description: str = ""

# CREATE
@router.post("/")
def create_sales_endpoint(sales: SalesCreate):
    return create_sales(sales.group_work_id, sales.name, sales.price, sales.description)

# GET ALL
@router.get("/")
def get_all_sales_endpoint():
    return get_all_sales()

# GET BY GROUP WORK
@router.get("/group-work/{group_work_id}")
def get_sales_by_group_work_endpoint(group_work_id: int):
    return get_sales_by_group_work(group_work_id)

# GET STATISTICS
@router.get("/statistics")
def get_sales_statistics_endpoint():
    return get_sales_statistics()

# GET MONTHLY DATA FOR CHART
@router.get("/monthly-data")
def get_monthly_sales_data_endpoint():
    return get_monthly_sales_data()

# UPDATE
@router.put("/{sales_id}")
def update_sales_endpoint(sales_id: int, sales: SalesUpdate):
    return update_sales(sales_id, sales.group_work_id, sales.name, sales.price, sales.description)

# DELETE
@router.delete("/{sales_id}")
def delete_sales_endpoint(sales_id: int):
    return delete_sales(sales_id)
