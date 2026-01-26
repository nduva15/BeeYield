from pydantic import BaseModel
from typing import list, Optional
from datetime import datetime

# --- Products ---
class ProductVariantBase(BaseModel):
    size: str
    price_kes: float
    stock_quantity: int
    is_available: bool = True

class ProductBase(BaseModel):
    name: str
    description: str
    category: str
    badge: Optional[str] = None
    images: list[str] = []

class ProductCreate(ProductBase):
    variants: list[ProductVariantBase]

class ProductVariant(ProductVariantBase):
    id: str

class Product(ProductBase):
    id: str
    rating: float
    review_count: int
    is_active: bool
    variants: list[ProductVariant] = []

# --- Cart ---
class CartItemAdd(BaseModel):
    product_id: str
    variant_id: str
    quantity: int

class CartItem(CartItemAdd):
    id: str
    product_name: str
    variant_size: str
    unit_price: float
    total_price: float

# --- Orders ---
class OrderItem(BaseModel):
    product_id: str
    variant_id: str
    quantity: int

class OrderCreate(BaseModel):
    shipping_address: dict
    payment_method: str # mpesa, card
    items: list[OrderItem]
    total_kes: float
    notes: Optional[str] = None

class Order(OrderCreate):
    id: str
    order_number: str
    status: str
    total_kes: float
    created_at: datetime
