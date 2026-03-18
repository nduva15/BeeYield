from fastapi import APIRouter, Depends, HTTPException, status, Request
from datetime import datetime
from typing import Any, Optional
from app.db.supabase_db import db_select, db_insert, db_update, db_delete, db_upsert, get_supabase
from app.services import traceability_service
from app.core import security
from pydantic import BaseModel

router = APIRouter()

# --- Security Helpers ---

def check_admin_role(current_user: dict = Depends(security.get_current_user)):
    """
    Ensure the current user has admin or superadmin role.
    """
    user_metadata = current_user.get("user_metadata", {})
    app_metadata = current_user.get("app_metadata", {})
    
    role = user_metadata.get("role") or app_metadata.get("role")
    
    if role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have administrative privileges."
        )
    return current_user

def get_token(request: Request) -> Optional[str]:
    """Extract raw token from Authorization header"""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    return None

# --- Schemas ---
class VariantCreate(BaseModel):
    size: str
    price_kes: float
    stock_quantity: int
    is_available: bool = True

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    price_kes: Optional[float] = 0
    stock_quantity: Optional[int] = 0
    is_active: bool = True
    images: list[str] = []
    variants: Optional[list[VariantCreate]] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price_kes: Optional[float] = None
    stock_quantity: Optional[int] = None
    is_active: Optional[bool] = None
    images: Optional[list[str]] = None
    variants: Optional[list[VariantCreate]] = None

class UserCreate(BaseModel):
    email: str
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str = "user"

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None

# --- Orders ---

@router.get("/orders", response_model=list[dict[str, Any]])
async def get_all_orders(current_admin: dict = Depends(check_admin_role), token: Optional[str] = Depends(get_token)):
    """
    Get all orders. Requires admin.
    """
    orders = await db_select("orders", token=token)
    for order in orders:
         if order.get("id"):
             order["items"] = await db_select("order_items", filters={"order_id": order["id"]}, token=token)
    return orders

@router.put("/orders/{order_id}/status", response_model=dict[str, Any])
async def update_order_status(
    order_id: str, 
    status_update: dict[str, str],
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Update the status of an order. Requires admin.
    """
    status_val = status_update.get("status")
    if not status_val:
        raise HTTPException(status_code=400, detail="Status is required")
    
    return await db_update("orders", {"status": status_val}, {"id": order_id}, token=token)

# --- Newsletter ---

@router.get("/newsletter", response_model=list[dict[str, Any]])
async def get_newsletter_subscribers(current_admin: dict = Depends(check_admin_role), token: Optional[str] = Depends(get_token)):
    """
    Get all newsletter subscribers. Requires admin.
    """
    return await db_select("newsletter_subscribers", token=token)

# --- Products ---

@router.get("/products", response_model=list[dict[str, Any]])
async def get_all_products(current_admin: dict = Depends(check_admin_role), token: Optional[str] = Depends(get_token)):
    """
    Get all products (including inactive). Requires admin.
    """
    products = await db_select("products", token=token)
    for product in products:
        product["variants"] = await db_select("product_variants", filters={"product_id": product["id"]}, token=token)
    return products

@router.post("/products", response_model=dict[str, Any])
async def create_product(
    product_in: ProductCreate,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Create a new product. Requires admin.
    """
    data = product_in.dict()
    variants_data = data.pop("variants", [])
    
    product_data = {
        "name": data["name"],
        "description": data["description"],
        "category": data["category"],
        "is_active": data["is_active"],
        "images": data["images"]
    }
    result = await db_insert("products", product_data, token=token)
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Unknown error"))
        
    inserted_data = result.get("data")
    if not inserted_data or len(inserted_data) == 0:
         raise HTTPException(status_code=500, detail="Failed to retrieve inserted product ID")
         
    product_id = inserted_data[0].get("id")
    
    if variants_data:
        for v in variants_data:
            variant_insert = {
                "product_id": product_id,
                "size": v.get("size", "Standard"),
                "price_kes": v.get("price_kes", 0),
                "stock_quantity": v.get("stock_quantity", 0),
                "is_available": v.get("is_available", True)
            }
            await db_insert("product_variants", variant_insert, token=token)
    elif product_id and (data.get("price_kes") is not None or data.get("stock_quantity") is not None):
        if data.get("price_kes") > 0 or data.get("stock_quantity") > 0:
            variant_data = {
                "product_id": product_id,
                "size": "Standard",
                "price_kes": data.get("price_kes", 0),
                "stock_quantity": data.get("stock_quantity", 0),
                "is_available": True
            }
            await db_insert("product_variants", variant_data, token=token)
        
    return {"status": "success", "id": product_id, "data": inserted_data[0]}

@router.put("/products/{product_id}", response_model=dict[str, Any])
async def update_product(
    product_id: str, 
    product_in: ProductUpdate,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Update a product. Requires admin.
    """
    data = product_in.dict(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No data to update")
        
    result = await db_update("products", data, {"id": product_id}, token=token)
    return result

@router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Soft delete product. Requires admin.
    """
    return await db_update("products", {"is_active": False}, {"id": product_id}, token=token)


# --- Users / Team ---

@router.get("/users", response_model=list[dict[str, Any]])
async def get_all_users(current_admin: dict = Depends(check_admin_role), token: Optional[str] = Depends(get_token)):
    """
    Get all users. Requires admin.
    """
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        users = await db_select("profiles", token=token)
        if not users:
            admin_users = supabase.auth.admin.list_users()
            users = [
                {
                    "id": u.id,
                    "email": u.email,
                    "role": u.user_metadata.get("role", "user") if u.user_metadata else "user",
                    "first_name": u.user_metadata.get("first_name") if u.user_metadata else "",
                    "last_name": u.user_metadata.get("last_name") if u.user_metadata else "",
                    "created_at": u.created_at
                } for u in admin_users.users
            ]
        return users
    except Exception as e:
        print(f"User Fetch Error: {e}")
        return []

@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str, 
    role_update: dict[str, str],
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Update user role. Requires admin.
    """
    role = role_update.get("role")
    if not role:
        raise HTTPException(status_code=400, detail="Role is required")
    
    supabase = get_supabase()
    if not supabase:
         raise HTTPException(status_code=500, detail="Database connection failed")
         
    try:
        supabase.auth.admin.update_user_by_id(
            user_id,
            attributes={"user_metadata": {"role": role}}
        )
        await db_update("profiles", {"role": role}, {"id": user_id}, token=token)
        return {"status": "success", "message": f"User role updated to {role}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/users", response_model=dict[str, Any])
async def create_user(
    user_in: UserCreate,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Create user. Requires admin.
    """
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        auth_res = supabase.auth.admin.create_user({
            "email": user_in.email,
            "password": user_in.password,
            "user_metadata": {
                "first_name": user_in.first_name,
                "last_name": user_in.last_name,
                "role": user_in.role,
                "full_name": f"{user_in.first_name} {user_in.last_name}".strip()
            },
            "email_confirm": True
        })
        
        user_id = getattr(auth_res, 'id', None)
        if not user_id and hasattr(auth_res, 'user'):
            user_id = auth_res.user.id
            
        if not user_id:
             raise HTTPException(status_code=400, detail="Failed to create user in auth")
            
        profile_data = {
            "id": user_id, 
            "email": user_in.email, 
            "first_name": user_in.first_name,
            "last_name": user_in.last_name,
            "full_name": f"{user_in.first_name} {user_in.last_name}".strip(),
            "role": user_in.role
        }
        res = await db_insert("profiles", profile_data, token=token)
        if not res.get("success"):
            if "duplicate key" not in res.get("error", "").lower():
                print(f"Warning: Profile insertion failed: {res.get('error')}")
        
        return {"status": "success", "user_id": user_id}

    except Exception as e:
        print(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/users/{user_id}", response_model=dict[str, Any])
async def update_user_details(
    user_id: str, 
    user_in: UserUpdate,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Update user details. Requires admin.
    """
    data = user_in.dict(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No data to update")
        
    supabase = get_supabase()
    if not supabase:
         raise HTTPException(status_code=500, detail="Database connection failed")
         
    try:
        meta = {}
        if "first_name" in data:
            meta["first_name"] = data["first_name"]
        if "last_name" in data:
            meta["last_name"] = data["last_name"]
        if "role" in data:
            meta["role"] = data["role"]
        
        updates = {}
        if meta:
            updates["user_metadata"] = meta
        if "email" in data:
            updates["email"] = data["email"]
        
        if updates:
            supabase.auth.admin.update_user_by_id(user_id, attributes=updates)
            
        await db_update("profiles", data, {"id": user_id}, token=token)
        return {"status": "success", "message": "User updated"}

    except Exception as e:
        print(f"Error updating user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Delete user. Requires admin.
    """
    supabase = get_supabase()
    try:
        supabase.auth.admin.delete_user(user_id)
        await db_delete("profiles", {"id": user_id}, token=token)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/contact", response_model=list[dict[str, Any]])
async def get_contact_submissions(current_admin: dict = Depends(check_admin_role), token: Optional[str] = Depends(get_token)):
    """
    Get all contact submissions. Requires admin.
    """
    return await db_select("contact_submissions", order_by="created_at", ascending=False, token=token)

@router.put("/contact/{contact_id}/status", response_model=dict[str, Any])
async def update_contact_status(
    contact_id: str, 
    status_update: dict[str, str],
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Update contact request status. Requires admin.
    """
    status_val = status_update.get("status")
    if not status_val:
         raise HTTPException(status_code=400, detail="Status is required")
    return await db_update("contact_submissions", {"status": status_val}, {"id": contact_id}, token=token)

@router.delete("/contact/{contact_id}")
async def delete_contact(
    contact_id: str,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    return await db_delete("contact_submissions", {"id": contact_id}, token=token)

# --- Newsletter CRUD ---
@router.delete("/newsletter/{subscriber_id}")
async def delete_subscriber(
    subscriber_id: str,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    return await db_delete("newsletter_subscribers", {"id": subscriber_id}, token=token)

# --- Pollination Contracts ---
@router.get("/pollination", response_model=list[dict[str, Any]])
async def get_pollination_contracts(current_admin: dict = Depends(check_admin_role), token: Optional[str] = Depends(get_token)):
    return await db_select("pollination_contracts", order_by="created_at", ascending=False, token=token)

@router.put("/pollination/{contract_id}/status", response_model=dict[str, Any])
async def update_pollination_status(
    contract_id: str, 
    status_update: dict[str, str],
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    status_val = status_update.get("status")
    if not status_val:
         raise HTTPException(status_code=400, detail="Status is required")
    return await db_update("pollination_contracts", {"status": status_val}, {"id": contract_id}, token=token)

@router.delete("/pollination/{contract_id}")
async def delete_pollination_contract(
    contract_id: str,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    return await db_delete("pollination_contracts", {"id": contract_id}, token=token)


# --- Stock Movements ---

@router.get("/stock", response_model=list[dict[str, Any]])
async def get_stock_movements(current_admin: dict = Depends(check_admin_role), token: Optional[str] = Depends(get_token)):
    """Get all stock movements. Requires admin."""
    return await db_select("stock_movements", order_by="created_at", ascending=False, token=token)

@router.post("/stock", response_model=dict[str, Any])
async def create_stock_movement(
    movement_in: dict[str, Any],
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """Register a new stock movement. Requires admin."""
    res = await db_insert("stock_movements", movement_in, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=f"Failed to record movement: {res.get('error')}")
    return res.get("data")[0] if res.get("data") else movement_in



# --- Generic Table Data ---

@router.get("/table/{table_name}")
async def get_admin_table_data(
    table_name: str,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    General purpose table fetcher with specific logic for honey data.
    """
    try:
        supabase = get_supabase()
        if not supabase:
            raise HTTPException(status_code=500, detail="Database connection failed")

        if table_name == "pollination_requests" or table_name == "pollination_contracts":
            res = supabase.table("pollination_contracts").select("*, farmer:farmers(name)").order("created_at", desc=True).execute()
            data = res.data if res.data else []
            for item in data:
                if item.get("farmer"):
                    item["name"] = item["farmer"].get("name")
                    item["farmer_name"] = item["farmer"].get("name")
            return data
            
        if table_name == "honey_batches" or table_name == "products":
            return await db_select(table_name, order_by="created_at", ascending=False, token=token)

        # Default select
        return await db_select(table_name, token=token)
    except Exception as e:
        print(f"Table fetch error for {table_name}: {e}")
        return []

# --- Dashboard Stats ---

@router.get("/stats", response_model=dict[str, Any])
async def get_admin_stats(current_admin: dict = Depends(check_admin_role), token: Optional[str] = Depends(get_token)):
    """Calculate high-level dashboard stats. Requires admin."""
    try:
        # Fallback counts if DB is empty
        orders = await db_select("orders", token=token)
        products = await db_select("products", token=token)
        users = await db_select("profiles", token=token)
        batches = await db_select("honey_batches", token=token)
        apiaries = await db_select("apiaries", token=token)
        hives = await db_select("hives", token=token)
        
        # Fetch pollination contracts with farmer name
        supabase = get_supabase()
        if not supabase:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        res = supabase.table("pollination_contracts").select("*, farmer:farmers(name)").order("created_at", desc=True).execute()
        pollination = res.data if res.data else []
        
        # Flatten farmer name into the record for UI compatibility
        for item in pollination:
            if item.get("farmer"):
                item["farmer_name"] = item["farmer"].get("name")
            del item["farmer"] # Remove the nested farmer object

        # Blockchain counts if DB empty
        if not batches or len(batches) == 0:
            from app.blockchain.honey_chain import honey_blockchain
            batches = [b["data"] for b in honey_blockchain.search_by_type(honey_blockchain.BlockType.BATCH_CREATION)]
            
        if not apiaries or len(apiaries) == 0:
            from app.blockchain.honey_chain import honey_blockchain
            apiaries = [b["data"] for b in honey_blockchain.search_by_type(honey_blockchain.BlockType.APIARY_REGISTRATION)]
            
        if not hives or len(hives) == 0:
            from app.blockchain.honey_chain import honey_blockchain
            hives = [b["data"] for b in honey_blockchain.search_by_type(honey_blockchain.BlockType.HIVE_REGISTRATION)]

        total_revenue = sum(float(o.get("total_amount", 0)) for o in orders if o.get("status") != "cancelled")
        total_honey_kg = sum(float(b.get("quantity_kg", 0) or b.get("total_quantity_kg", 0)) for b in batches)
        total_acres = sum(float(p.get("farm_size_acres", 0)) for p in pollination)
        
        return {
            "total_orders": len(orders),
            "total_products": len(products),
            "total_users": len(users),
            "total_batches": len(batches),
            "total_apiaries": len(apiaries),
            "total_hives": len(hives),
            "total_pollination": len(pollination),
            "total_revenue_kes": total_revenue,
            "total_honey_kg": total_honey_kg,
            "total_acres": total_acres,
            "pending_orders": len([o for o in orders if o.get("status") == "pending"]),
            "active_products": len([p for p in products if p.get("is_active")]),
            "last_updated": datetime.utcnow().isoformat()
        }
    except Exception as e:
        print(f"Stats Error: {e}")
        return {"error": str(e)}

@router.post("/sync-all")
async def sync_all_data(current_admin: dict = Depends(check_admin_role), token: Optional[str] = Depends(get_token)):
    """
    Unified Sync: Pulls data from Blockchain and ensures critical tables are populated.
    """
    from app.blockchain.honey_chain import honey_blockchain
    sync_results = {"batches": 0, "apiaries": 0, "hives": 0, "farmers": 0}
    
    # Sync Batches
    bc_batches = honey_blockchain.search_by_type(honey_blockchain.BlockType.BATCH_CREATION)
    for b in bc_batches:
        await db_upsert("honey_batches", b["data"], on_conflict="id", token=token)
        sync_results["batches"] += 1
        
    # Sync Apiaries
    bc_apiaries = honey_blockchain.search_by_type(honey_blockchain.BlockType.APIARY_REGISTRATION)
    for a in bc_apiaries:
        await db_upsert("apiaries", a["data"], on_conflict="id", token=token)
        sync_results["apiaries"] += 1
        
    # Sync Hives
    bc_hives = honey_blockchain.search_by_type(honey_blockchain.BlockType.HIVE_REGISTRATION)
    for h in bc_hives:
        await db_upsert("hives", h["data"], on_conflict="id", token=token)
        sync_results["hives"] += 1

    return {"status": "success", "synced": sync_results}

@router.post("/seed-data")
async def seed_dashboard_data(current_admin: dict = Depends(check_admin_role), token: Optional[str] = Depends(get_token)):
    """
    Seed minimal demo data for Admin Dashboard if DB is empty.
    """
    # Seed Products
    existing_products = await db_select("products", limit=1, token=token)
    if not existing_products:
        await db_insert("products", {
            "name": "Organic Wildflower Honey", 
            "description": "Pure raw honey from the Rift Valley.",
            "category": "honey",
            "price_kes": 1200,
            "stock_quantity": 50,
            "is_active": True,
            "images": ["https://images.unsplash.com/photo-1587049352846-4a222e784d38"]
        }, token=token)
        
    # Seed Newsletter
    existing_subs = await db_select("newsletter_subscribers", limit=1, token=token)
    if not existing_subs:
        await db_insert("newsletter_subscribers", {"email": "timothynduva349@gmail.com", "status": "active"}, token=token)
        
    return {"status": "success", "message": "Demo data seeded where missing."}

# --- Traceability (Honey Chain) ---

@router.post("/batches", response_model=dict[str, Any])
async def create_batch(
    batch_in: dict[str, Any],
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Create a new batch in the blockchain. Requires admin.
    """
    return await traceability_service.create_batch(batch_in, token=token)

@router.get("/batches", response_model=list[dict[str, Any]])
async def get_batches_db(current_admin: dict = Depends(check_admin_role), token: Optional[str] = Depends(get_token)):
    """
    Get all batches from the DB. Requires admin.
    """
    data = []
    try:
        data = await db_select("honey_batches", order_by="created_at", ascending=False, token=token)
    except Exception as e:
        print(f"DB Batch Fetch Error: {e}")

    if not data or len(data) == 0:
        from app.blockchain.honey_chain import honey_blockchain
        blockchain_batches = honey_blockchain.search_by_type(honey_blockchain.BlockType.BATCH_CREATION)
        if blockchain_batches:
            data = [b["data"] for b in blockchain_batches]
            for item in data:
                if 'quantity_kg' not in item and 'total_quantity_kg' in item:
                    item['quantity_kg'] = item['total_quantity_kg']
    
    return data

@router.put("/batches/{batch_id}", response_model=dict[str, Any])
async def update_batch_admin(
    batch_id: str,
    batch_in: dict[str, Any],
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Update a batch record.
    """
    res = await db_update("honey_batches", batch_in, {"id": batch_id}, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=f"Failed to update batch: {res.get('error')}")
    return res.get("data")[0] if res.get("data") else batch_in

@router.delete("/batches/{batch_id}")
async def delete_batch(
    batch_id: str,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """Delete a batch."""
    return await db_delete("honey_batches", {"id": batch_id}, token=token)

# --- Farmers ---

@router.get("/farmers", response_model=list[dict[str, Any]])
async def get_all_farmers(current_admin: dict = Depends(check_admin_role), token: Optional[str] = Depends(get_token)):
    """
    Get all registered farmers. Requires admin.
    """
    data = []
    try:
        data = await db_select("farmers", order_by="created_at", ascending=False, token=token)
    except Exception as e:
        print(f"DB Farmer Fetch Error: {e}")

    if not data or len(data) == 0:
        from app.blockchain.honey_chain import honey_blockchain
        blockchain_farmers = honey_blockchain.search_by_type(honey_blockchain.BlockType.FARMER_REGISTRATION)
        if blockchain_farmers:
            data = [b["data"] for b in blockchain_farmers]

    return data

@router.post("/farmers", response_model=dict[str, Any])
async def create_farmer_admin(
    farmer_in: dict[str, Any],
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    """
    Create a new farmer record. Requires admin.
    """
    from app.schemas import traceability as schemas
    try:
        f_schema = schemas.FarmerCreate(**farmer_in)
        return await traceability_service.register_farmer(f_schema, token=token)
    except Exception as e:
        if not farmer_in.get('farmer_id'):
            import uuid
            farmer_in['farmer_id'] = f"F-{str(uuid.uuid4())[:8].upper()}"
        
        res = await db_insert("farmers", farmer_in, token=token)
        if not res.get("success"):
            raise HTTPException(status_code=500, detail=f"Failed to register farmer: {res.get('error') or str(e)}")
        return res.get("data")[0] if res.get("data") else farmer_in

@router.put("/farmers/{farmer_id}", response_model=dict[str, Any])
async def update_farmer_admin(
    farmer_id: str, 
    farmer_in: dict[str, Any],
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    res = await db_update("farmers", farmer_in, {"id": farmer_id}, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=f"Update failed: {res.get('error')}")
    return res.get("data")[0] if res.get("data") else farmer_in

@router.delete("/farmers/{farmer_id}")
async def delete_farmer_admin(
    farmer_id: str,
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    res = await db_delete("farmers", {"id": farmer_id}, token=token)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=f"Deletion failed: {res.get('error')}")
    return {"status": "success"}

# --- Apiaries & Hives ---

@router.get("/apiaries", response_model=list[dict[str, Any]])
async def get_all_apiaries(current_admin: dict = Depends(check_admin_role), token: Optional[str] = Depends(get_token)):
    data = []
    try:
        data = await db_select("apiaries", order_by="created_at", ascending=False, token=token)
    except Exception:
        pass
    
    if not data:
        from app.blockchain.honey_chain import honey_blockchain
        blocks = honey_blockchain.search_by_type(honey_blockchain.BlockType.APIARY_REGISTRATION)
        data = [b["data"] for b in blocks]
    return data

@router.post("/apiaries", response_model=dict[str, Any])
async def create_apiary_admin(
    apiary_in: dict[str, Any],
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    from app.schemas import traceability as schemas
    if isinstance(apiary_in, dict):
        if not apiary_in.get('apiary_code'):
            import uuid
            apiary_in['apiary_code'] = f"APY-{str(uuid.uuid4())[:8].upper()}"
        
        try:
            apiary_obj = schemas.ApiaryCreate(**apiary_in)
            return await traceability_service.register_apiary(apiary_obj, token=token)
        except Exception:
            return await traceability_service.register_apiary(apiary_in, token=token)
    
    return await traceability_service.register_apiary(apiary_in, token=token)

@router.get("/hives", response_model=list[dict[str, Any]])
async def get_all_hives(current_admin: dict = Depends(check_admin_role), token: Optional[str] = Depends(get_token)):
    data = []
    try:
        data = await db_select("hives", order_by="created_at", ascending=False, token=token)
    except Exception:
        pass
    
    if not data:
        from app.blockchain.honey_chain import honey_blockchain
        blocks = honey_blockchain.search_by_type(honey_blockchain.BlockType.HIVE_REGISTRATION)
        data = [b["data"] for b in blocks]
    return data

@router.post("/hives", response_model=dict[str, Any])
async def create_hive_admin(
    hive_in: dict[str, Any],
    current_admin: dict = Depends(check_admin_role),
    token: Optional[str] = Depends(get_token)
):
    return await traceability_service.register_hive(hive_in, token=token)

# --- Database Cleanup (Danger Zone) ---

@router.delete("/danger/clear-traceability")
async def clear_all_traceability(current_admin: dict = Depends(check_admin_role), token: Optional[str] = Depends(get_token)):
    """Wipe all traceability data from DB. Use with caution!"""
    email = current_admin.get('email', '').lower()
    is_super = current_admin.get('role') == 'super_admin' or email in ['timothy.mathuva@strathmore.edu', 'timothynduva349@gmail.com']
    
    if not is_super:
        raise HTTPException(status_code=403, detail="Super-admin privileges required for this action.")
        
    try:
        await db_delete("hives", {}, token=token)
        await db_delete("apiaries", {}, token=token)
        await db_delete("farmers", {}, token=token)
        await db_delete("honey_batches", {}, token=token)
        return {"success": True, "message": "All traceability records purged from database."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

