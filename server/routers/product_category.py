from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from crud.product_category import (
    get_all_categories,
    get_category_by_id,
    create_category,
    update_category,
    delete_category
)

router = APIRouter(
    prefix="/product_categories",
    tags=["product_categories"]
)

# Pydantic models
class CategoryCreate(BaseModel):
    name: str
    description: str = None

class CategoryUpdate(BaseModel):
    name: str = None
    description: str = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: str = None
    created_at: str
    status: str

# GET all categories
@router.get("/")
def get_categories():
    return get_all_categories()

# GET category by ID
@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int):
    category = get_category_by_id(category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

# CREATE category
@router.post("/", response_model=CategoryResponse)
def create_new_category(category: CategoryCreate):
    return create_category(category.name, category.description)

# UPDATE category
@router.put("/{category_id}", response_model=CategoryResponse)
def update_existing_category(category_id: int, category: CategoryUpdate):
    updated_category = update_category(category_id, category.name, category.description)
    if not updated_category:
        raise HTTPException(status_code=404, detail="Category not found")
    return updated_category

# DELETE category (soft delete)
@router.delete("/{category_id}")
def delete_existing_category(category_id: int):
    deleted_category = delete_category(category_id)
    if not deleted_category:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}
