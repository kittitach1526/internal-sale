from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from crud.product_type import (
    get_all_types,
    get_types_by_category,
    get_type_by_id,
    create_type,
    update_type,
    delete_type
)

router = APIRouter(
    prefix="/product_types",
    tags=["product_types"]
)

# Pydantic models
class TypeCreate(BaseModel):
    category_id: int
    name: str
    description: str = None

class TypeUpdate(BaseModel):
    category_id: int = None
    name: str = None
    description: str = None

class TypeResponse(BaseModel):
    id: int
    category_id: int
    name: str
    description: str = None
    created_at: str
    status: str

class TypeWithCategoryResponse(BaseModel):
    id: int
    category_id: int
    name: str
    description: str = None
    created_at: str
    status: str
    category_name: str

# GET all types
@router.get("/")
def get_types():
    return get_all_types()

# GET types by category
@router.get("/category/{category_id}")
def get_types_by_category_id(category_id: int):
    return get_types_by_category(category_id)

# GET type by ID
@router.get("/{type_id}")
def get_type(type_id: int):
    product_type = get_type_by_id(type_id)
    if not product_type:
        raise HTTPException(status_code=404, detail="Type not found")
    return product_type

# CREATE type
@router.post("/")
def create_new_type(product_type: TypeCreate):
    return create_type(product_type.category_id, product_type.name, product_type.description)

# UPDATE type
@router.put("/{type_id}")
def update_existing_type(type_id: int, product_type: TypeUpdate):
    updated_type = update_type(type_id, product_type.category_id, product_type.name, product_type.description)
    if not updated_type:
        raise HTTPException(status_code=404, detail="Type not found")
    return updated_type

# DELETE type (soft delete)
@router.delete("/{type_id}")
def delete_existing_type(type_id: int):
    deleted_type = delete_type(type_id)
    if not deleted_type:
        raise HTTPException(status_code=404, detail="Type not found")
    return {"message": "Type deleted successfully"}
