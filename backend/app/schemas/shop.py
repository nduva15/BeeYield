from pydantic import BaseModel
from typing import Optional
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
    delivery_method: str = "delivery" # delivery, pickup
    items: list[OrderItem]
    total_kes: float
    coupon_code: Optional[str] = None
    notes: Optional[str] = None
    idempotency_key: Optional[str] = None # Added for Oxidized Financial Core

class Order(OrderCreate):
    id: str
    order_number: str
    status: str
    total_kes: float
    created_at: datetime
    payment_status: Optional[str] = "pending"

# --- Address ---
class AddressBase(BaseModel):
    name: str = "Home"
    email: Optional[str] = None
    phone: str
    street: str
    apartment: Optional[str] = None
    building: Optional[str] = None
    floor: Optional[str] = None
    city: str
    county: str
    postal_code: Optional[str] = None
    is_default: bool = False

class AddressCreate(AddressBase):
    pass

class Address(AddressBase):
    id: str
    user_id: str

# --- Payment Methods ---
class PaymentMethodCreate(BaseModel):
    type: str = "card" # card, mpesa
    provider: str = "Visa"
    last4: str
    expiry_month: Optional[int] = None
    expiry_year: Optional[int] = None
    card_holder_name: Optional[str] = None
    is_default: bool = False

class PaymentMethod(PaymentMethodCreate):
    id: str
    user_id: str
    created_at: datetime

# --- Wallet ---

class WalletTransaction(BaseModel):
    id: str
    type: str
    amount: float
    description: str
    reference_id: Optional[str] = None
    created_at: datetime

class Wallet(BaseModel):
    user_id: str
    balance: float
    currency: str
    updated_at: datetime

# --- Wishlist ---
class WishlistItem(BaseModel):
    id: str
    product_id: str
    created_at: datetime
    # Optional expanded product data
    product_name: Optional[str] = None
    product_image: Optional[str] = None
    product_price: Optional[float] = None
    product: Optional[dict] = None

# --- Tracking ---
class TrackingEvent(BaseModel):
    status: str
    location: Optional[str] = None
    description: str
    created_at: datetime

class TrackingInfo(BaseModel):
    order_id: str
    current_status: str
    estimated_delivery: Optional[str] = None
    events: list[TrackingEvent]


class CouponValidationRequest(BaseModel):
    code: str
    amount: float


class CouponValidationResult(BaseModel):
    valid: bool
    code: str
    discount_percent: float = 0
    discount_amount: float = 0
    message: str

