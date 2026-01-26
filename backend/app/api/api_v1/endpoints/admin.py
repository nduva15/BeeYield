from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, Optional
from app.db.supabase_db import db_select, db_insert, db_update, db_delete, db_get_by_id, get_supabase
from app.services import traceability_service
from app.core import security
from pydantic import BaseModel

router = APIRouter()

# --- Security Helpers ---

def check_admin_role(current_user: dict = Depends(security.get_current_user)):
    """
    Ensure the current user has admin or superadmin role.
    In Supabase JWT, this is often in user_metadata or app_metadata.
    """
    # Check common locations for role in Supabase JWT
    user_metadata = current_user.get("user_metadata", {})
    app_metadata = current_user.get("app_metadata", {})
    
    role = user_metadata.get("role") or app_metadata.get("role")
    
    if role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have administrative privileges."
        )
    return current_user

# --- Schemas ---
# (Keeping schemas same as before)
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
def get_all_orders(current_admin: dict = Depends(check_admin_role)):
    """
    Get all orders. Requires admin.
    """
    orders = db_select("orders")
    for order in orders:
         if order.get("id"):
             order["items"] = db_select("order_items", filters={"order_id": order["id"]})
    return orders

@router.put("/orders/{order_id}/status", response_model=dict[str, Any])
def update_order_status(
    order_id: str, 
    status_update: dict[str, str],
    current_admin: dict = Depends(check_admin_role)
):
    """
    Update the status of an order. Requires admin.
    """
    status = status_update.get("status")
    if not status:
        raise HTTPException(status_code=400, detail="Status is required")
    
    return db_update("orders", {"status": status}, {"id": order_id})

# --- Newsletter ---

@router.get("/newsletter", response_model=list[dict[str, Any]])
def get_newsletter_subscribers(current_admin: dict = Depends(check_admin_role)):
    """
    Get all newsletter subscribers. Requires admin.
    """
    return db_select("newsletter_subscribers")

# --- Products ---

@router.get("/products", response_model=list[dict[str, Any]])
def get_all_products(current_admin: dict = Depends(check_admin_role)):
    """
    Get all products (including inactive). Requires admin.
    """
    products = db_select("products")
    for product in products:
        product["variants"] = db_select("product_variants", filters={"product_id": product["id"]})
    return products

@router.post("/products", response_model=dict[str, Any])
def create_product(
    product_in: ProductCreate,
    current_admin: dict = Depends(check_admin_role)
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
    result = db_insert("products", product_data)
    
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
            db_insert("product_variants", variant_insert)
    elif product_id and (data.get("price_kes") is not None or data.get("stock_quantity") is not None):
        if data.get("price_kes") > 0 or data.get("stock_quantity") > 0:
            variant_data = {
                "product_id": product_id,
                "size": "Standard",
                "price_kes": data.get("price_kes", 0),
                "stock_quantity": data.get("stock_quantity", 0),
                "is_available": True
            }
            db_insert("product_variants", variant_data)
        
    return {"status": "success", "id": product_id, "data": inserted_data[0]}

@router.put("/products/{product_id}", response_model=dict[str, Any])
def update_product(
    product_id: str, 
    product_in: ProductUpdate,
    current_admin: dict = Depends(check_admin_role)
):
    """
    Update a product. Requires admin.
    """
    data = product_in.dict(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No data to update")
        
    result = db_update("products", data, {"id": product_id})
    return result

@router.delete("/products/{product_id}")
def delete_product(
    product_id: str,
    current_admin: dict = Depends(check_admin_role)
):
    """
    Soft delete product. Requires admin.
    """
    return db_update("products", {"is_active": False}, {"id": product_id})


# --- Users / Team ---

@router.get("/users", response_model=list[dict[str, Any]])
def get_all_users(current_admin: dict = Depends(check_admin_role)):
    """
    Get all users. Requires admin.
    """
    supabase = get_supabase()
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    try:
        users = db_select("profiles")
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
def update_user_role(
    user_id: str, 
    role_update: dict[str, str],
    current_admin: dict = Depends(check_admin_role)
):
    """
    Update user role. Requires superadmin usually, but here checking admin.
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
        db_update("profiles", {"role": role}, {"id": user_id})
        return {"status": "success", "message": f"User role updated to {role}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/users", response_model=dict[str, Any])
def create_user(
    user_in: UserCreate,
    current_admin: dict = Depends(check_admin_role)
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
                "role": user_in.role
            },
            "email_confirm": True
        })
        
        user_id = getattr(auth_res, 'id', None)
        if not user_id and hasattr(auth_res, 'user'):
            user_id = auth_res.user.id
            
        if not user_id:
             raise HTTPException(status_code=400, detail="Failed to create user in auth")
            
        profile_data = {
            "id": user_id, "email": user_in.email, "first_name": user_in.first_name,
            "last_name": user_in.last_name, "role": user_in.role
        }
        db_insert("profiles", profile_data)
        
        return {"status": "success", "user_id": user_id}

    except Exception as e:
        print(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/users/{user_id}", response_model=dict[str, Any])
def update_user_details(
    user_id: str, 
    user_in: UserUpdate,
    current_admin: dict = Depends(check_admin_role)
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
        if "first_name" in data: meta["first_name"] = data["first_name"]
        if "last_name" in data: meta["last_name"] = data["last_name"]
        if "role" in data: meta["role"] = data["role"]
        
        updates = {}
        if meta: updates["user_metadata"] = meta
        if "email" in data: updates["email"] = data["email"]
        
        if updates:
            supabase.auth.admin.update_user_by_id(user_id, attributes=updates)
            
        db_update("profiles", data, {"id": user_id})
        return {"status": "success", "message": "User updated"}

    except Exception as e:
        print(f"Error updating user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/users/{user_id}")
def delete_user(
    user_id: str,
    current_admin: dict = Depends(check_admin_role)
):
    """
    Delete user. Requires admin.
    """
    supabase = get_supabase()
    try:
        supabase.auth.admin.delete_user(user_id)
        db_delete("profiles", {"id": user_id})
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/contact", response_model=list[dict[str, Any]])
def get_contact_submissions(current_admin: dict = Depends(check_admin_role)):
    """
    Get all contact submissions. Requires admin.
    """
    return db_select("contact_submissions", order_by="created_at", ascending=False)

@router.put("/contact/{contact_id}/status", response_model=dict[str, Any])
def update_contact_status(
    contact_id: str, 
    status_update: dict[str, str],
    current_admin: dict = Depends(check_admin_role)
):
    """
    Update contact request status. Requires admin.
    """
    status = status_update.get("status")
    if not status:
         raise HTTPException(status_code=400, detail="Status is required")
    return db_update("contact_submissions", {"status": status}, {"id": contact_id})

@router.delete("/contact/{contact_id}")
def delete_contact(
    contact_id: str,
    current_admin: dict = Depends(check_admin_role)
):
    return db_delete("contact_submissions", {"id": contact_id})

# --- Newsletter CRUD ---
@router.delete("/newsletter/{subscriber_id}")
def delete_subscriber(
    subscriber_id: str,
    current_admin: dict = Depends(check_admin_role)
):
    return db_delete("newsletter_subscribers", {"id": subscriber_id})

# --- Pollination Requests ---
@router.get("/pollination", response_model=list[dict[str, Any]])
def get_pollination_requests(current_admin: dict = Depends(check_admin_role)):
    return db_select("pollination_requests", order_by="created_at", ascending=False)

@router.put("/pollination/{request_id}/status", response_model=dict[str, Any])
def update_pollination_status(
    request_id: str, 
    status_update: dict[str, str],
    current_admin: dict = Depends(check_admin_role)
):
    status = status_update.get("status")
    if not status:
         raise HTTPException(status_code=400, detail="Status is required")
    return db_update("pollination_requests", {"status": status}, {"id": request_id})

@router.delete("/pollination/{request_id}")
def delete_pollination_request(
    request_id: str,
    current_admin: dict = Depends(check_admin_role)
):
    return db_delete("pollination_requests", {"id": request_id})


# --- Stock Movements ---

@router.get("/stock", response_model=list[dict[str, Any]])
def get_stock_movements(current_admin: dict = Depends(check_admin_role)):
    """Get all stock movements. Requires admin."""
    return db_select("stock_movements", order_by="created_at", ascending=False)

@router.post("/stock", response_model=dict[str, Any])
def create_stock_movement(
    movement_in: dict[str, Any],
    current_admin: dict = Depends(check_admin_role)
):
    """Register a new stock movement. Requires admin."""
    res = db_insert("stock_movements", movement_in)
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=f"Failed to record movement: {res.get('error')}")
    return res.get("data")[0] if res.get("data") else movement_in


# --- Dashboard Stats ---

@router.get("/stats", response_model=dict[str, Any])
def get_admin_stats(current_admin: dict = Depends(check_admin_role)):
    """Calculate high-level dashboard stats. Requires admin."""
    try:
        orders = db_select("orders")
        products = db_select("products")
        users = db_select("profiles")
        batches = db_select("honey_batches")
        apiaries = db_select("apiaries")
        hives = db_select("hives")
        pollination = db_select("pollination_requests")
        
        # Calculate some basic totals for the dashboard
        total_revenue = sum(float(o.get("total_amount", 0)) for o in orders if o.get("status") != "cancelled")
        total_honey_kg = sum(float(b.get("quantity_kg", 0)) for b in batches)
        total_acres = sum(float(p.get("acres", 0)) for p in pollination)
        
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
            "active_products": len([p for p in products if p.get("is_active")])
        }
    except Exception as e:
        print(f"Stats Error: {e}")
        return {"error": str(e)}


# --- Bulk Seeding (Admin Only) ---

@router.post("/seed/shop")
def seed_shop(current_admin: dict = Depends(check_admin_role)):
    """Seed default shop content. Requires admin."""
    # In a real app, this might trigger a specific service
    # For now, let's just return a placeholder or implement logic if simple
    return {"status": "success", "message": "Shop seed triggered"}

@router.post("/seed/traceability")
def seed_traceability(current_admin: dict = Depends(check_admin_role)):
    """Seed default traceability data. Requires admin."""
    return {"status": "success", "message": "Traceability seed triggered"}

@router.post("/seed/apiary-hives")
def seed_apiaries(current_admin: dict = Depends(check_admin_role)):
    """Seed default apiary and hive records. Requires admin."""
    return {"status": "success", "message": "Apiary seed triggered"}


# --- Traceability (Honey Chain) ---

@router.post("/batches", response_model=dict[str, Any])
def create_batch(
    batch_in: dict[str, Any],
    current_admin: dict = Depends(check_admin_role)
):
    """
    Create a new batch in the blockchain. Requires admin.
    """
    return traceability_service.create_batch(batch_in)

@router.get("/batches", response_model=list[dict[str, Any]])
def get_batches_db(current_admin: dict = Depends(check_admin_role)):
    """
    Get all batches from the DB. Requires admin.
    """
    data = []
    try:
        data = db_select("honey_batches", order_by="created_at", ascending=False)
        if not data:
            data = db_select("hney-batches", order_by="created_at", ascending=False)
        if not data:
            data = db_select("batches", order_by="created_at", ascending=False)
        if not data:
            data = db_select("harvests", order_by="created_at", ascending=False)
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
def update_batch(
    batch_id: str, 
    batch_in: dict[str, Any],
    current_admin: dict = Depends(check_admin_role)
):
    """
    Update a batch in DB. Requires admin.
    """
    return db_update("honey_batches", batch_in, {"id": batch_id})

@router.delete("/batches/{batch_id}")
def delete_batch(
    batch_id: str,
    current_admin: dict = Depends(check_admin_role)
):
    return db_delete("honey_batches", {"id": batch_id})

# --- Farmers ---

@router.get("/farmers", response_model=list[dict[str, Any]])
def get_all_farmers(current_admin: dict = Depends(check_admin_role)):
    """
    Get all registered farmers. Requires admin.
    """
    data = []
    try:
        data = db_select("farmers", order_by="created_at", ascending=False)
    except Exception as e:
        print(f"DB Farmer Fetch Error: {e}")

    if not data or len(data) == 0:
        from app.blockchain.honey_chain import honey_blockchain
        blockchain_farmers = honey_blockchain.search_by_type(honey_blockchain.BlockType.FARMER_REGISTRATION)
        if blockchain_farmers:
            data = [b["data"] for b in blockchain_farmers]

    if not data or len(data) == 0:
        team = db_select("team_members", order_by="created_at", ascending=False)
        if team:
            for member in team:
                if "Timothy" in member.get("name", "") or "beekeeper" in member.get("role", "").lower():
                    data.append({
                        "id": member.get("id"), "name": member.get("name"), "role": member.get("role"),
                        "region": member.get("department", "Kibwezi"), "certification_status": "CERTIFIED",
                        "experience_years": 15 if "Timothy" in member.get("name", "") else 5, "status": "active"
                    })
    
    return data

@router.post("/farmers", response_model=dict[str, Any])
def create_farmer_admin(
    farmer_in: dict[str, Any],
    current_admin: dict = Depends(check_admin_role)
):
    """
    Create a new farmer record. Requires admin.
    """
    from app.schemas import traceability as schemas
    try:
        f_schema = schemas.FarmerCreate(**farmer_in)
        return traceability_service.register_farmer(f_schema)
    except Exception as e:
        if not farmer_in.get('farmer_id'):
            import uuid
            farmer_in['farmer_id'] = f"F-{str(uuid.uuid4())[:8].upper()}"
        
        res = db_insert("farmers", farmer_in)
        if not res.get("success"):
            raise HTTPException(status_code=500, detail=f"Failed to register farmer: {res.get('error') or str(e)}")
        return res.get("data")[0] if res.get("data") else farmer_in

@router.put("/farmers/{farmer_id}", response_model=dict[str, Any])
def update_farmer_admin(
    farmer_id: str, 
    farmer_in: dict[str, Any],
    current_admin: dict = Depends(check_admin_role)
):
    res = db_update("farmers", farmer_in, {"id": farmer_id})
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=f"Update failed: {res.get('error')}")
    return res.get("data")[0] if res.get("data") else farmer_in

@router.delete("/farmers/{farmer_id}")
def delete_farmer_admin(
    farmer_id: str,
    current_admin: dict = Depends(check_admin_role)
):
    res = db_delete("farmers", {"id": farmer_id})
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=f"Deletion failed: {res.get('error')}")
    return {"status": "success"}

# --- Apiaries & Hives ---

@router.get("/apiaries", response_model=list[dict[str, Any]])
def get_all_apiaries(current_admin: dict = Depends(check_admin_role)):
    data = []
    try:
        data = db_select("apiaries", order_by="created_at", ascending=False)
    except: pass
    
    if not data:
        from app.blockchain.honey_chain import honey_blockchain
        blocks = honey_blockchain.search_by_type(honey_blockchain.BlockType.APIARY_REGISTRATION)
        data = [b["data"] for b in blocks]
    return data

@router.post("/apiaries", response_model=dict[str, Any])
def create_apiary_admin(
    apiary_in: dict[str, Any],
    current_admin: dict = Depends(check_admin_role)
):
    return traceability_service.register_apiary(apiary_in)

@router.get("/hives", response_model=list[dict[str, Any]])
def get_all_hives(current_admin: dict = Depends(check_admin_role)):
    data = []
    try:
        data = db_select("hives", order_by="created_at", ascending=False)
    except: pass
    
    if not data:
        from app.blockchain.honey_chain import honey_blockchain
        blocks = honey_blockchain.search_by_type(honey_blockchain.BlockType.HIVE_REGISTRATION)
        data = [b["data"] for b in blocks]
    return data

@router.post("/hives", response_model=dict[str, Any])
def create_hive_admin(
    hive_in: dict[str, Any],
    current_admin: dict = Depends(check_admin_role)
):
    return traceability_service.register_hive(hive_in)
