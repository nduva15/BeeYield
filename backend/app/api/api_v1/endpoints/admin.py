from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from app.db.supabase_db import db_select, db_insert, db_update, db_delete, db_get_by_id
from app.services import traceability_service
from pydantic import BaseModel

router = APIRouter()

# --- Schemas ---

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    price_kes: Optional[float] = 0
    stock_quantity: Optional[int] = 0
    is_active: bool = True
    images: List[str] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price_kes: Optional[float] = None
    stock_quantity: Optional[int] = None
    is_active: Optional[bool] = None
    images: Optional[List[str]] = None

# --- Orders ---

@router.get("/orders", response_model=List[Dict[str, Any]])
def get_all_orders():
    """
    Get all orders.
    """
    orders = db_select("orders")
    # Enrich with items?
    for order in orders:
         if order.get("id"):
             order["items"] = db_select("order_items", filters={"order_id": order["id"]})
    return orders

@router.put("/orders/{order_id}/status", response_model=Dict[str, Any])
def update_order_status(order_id: str, status_update: Dict[str, str]):
    """
    Update the status of an order.
    """
    status = status_update.get("status")
    if not status:
        raise HTTPException(status_code=400, detail="Status is required")
    
    return db_update("orders", {"status": status}, {"id": order_id})

# --- Newsletter ---

@router.get("/newsletter", response_model=List[Dict[str, Any]])
def get_newsletter_subscribers():
    """
    Get all newsletter subscribers.
    """
    return db_select("newsletter_subscribers")

# --- Products ---

@router.get("/products", response_model=List[Dict[str, Any]])
def get_all_products():
    """
    Get all products (including inactive).
    """
    products = db_select("products")
    # Enrich with variants if needed, but for list view maybe just basic info is enough?
    # Let's include variants to be safe
    for product in products:
        product["variants"] = db_select("product_variants", filters={"product_id": product["id"]})
    return products

@router.post("/products", response_model=Dict[str, Any])
def create_product(product_in: ProductCreate):
    """
    Create a new product.
    """
    # Simply insert into products table
    # This is a simplified version, ideally we deal with variants separately or together
    # For now assuming simple product structure or user manages variants separately
    data = product_in.dict()
    # price and stock are actually on variants usually, but if we want to support simple products:
    # We might need to create a default variant
    
    # 1. Create Product
    product_data = {
        "name": data["name"],
        "description": data["description"],
        "category": data["category"],
        "is_active": data["is_active"],
        "images": data["images"]
    }
    result = db_insert("products", product_data)
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Unknown error"))
        
    # Access the inserted product ID from the data list
    inserted_data = result.get("data")
    if not inserted_data or len(inserted_data) == 0:
         raise HTTPException(status_code=500, detail="Failed to retrieve inserted product ID")
         
    product_id = inserted_data[0].get("id")
    
    # 2. Create Default Variant if price/stock provided
    if product_id and (data.get("price_kes") is not None or data.get("stock_quantity") is not None):
        variant_data = {
            "product_id": product_id,
            "size": "Standard",
            "price_kes": data.get("price_kes", 0),
            "stock_quantity": data.get("stock_quantity", 0),
            "is_available": True
        }
        db_insert("product_variants", variant_data)
        
    return {"status": "success", "id": product_id, "data": inserted_data[0]}

@router.put("/products/{product_id}", response_model=Dict[str, Any])
def update_product(product_id: str, product_in: ProductUpdate):
    """
    Update a product.
    """
    data = product_in.dict(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No data to update")
        
    result = db_update("products", data, {"id": product_id})
    return result

@router.delete("/products/{product_id}")
def delete_product(product_id: str):
    """
    Delete a product (soft delete preferred usually, but here 'delete').
    """
    # db_delete usually implemented? 
    # If not, maybe update is_active=False
    return db_update("products", {"is_active": False}, {"id": product_id})


# --- Traceability (Honey Chain) ---

@router.post("/batches", response_model=Dict[str, Any])
def create_batch(batch_in: Dict[str, Any]):
    """
    Create a new batch in the blockchain.
    """
    return traceability_service.create_batch(batch_in)

@router.get("/batches", response_model=List[Dict[str, Any]])
def get_batches():
    """
    Get all batches from the blockchain (mocked/simulated or from DB cache).
    Since blockchain is a list of blocks, we can iterate and filter.
    """
    from app.blockchain.honey_chain import honey_blockchain, BlockType
    
    batches = []
    for block in honey_blockchain.chain:
        if block.block_type == BlockType.BATCH_CREATION:
            batch_data = block.data
            batch_data['block_hash'] = block.hash
            batch_data['created_at'] = block.timestamp
            batches.append(batch_data)
            
    return batches
