from pydantic_settings import BaseSettings
from typing import List, Optional, Union
from pydantic import field_validator, Field

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "BeeYield Backend"
    
    # CORS (Cross-Origin Resource Sharing)
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8080",  # <-- ADDED: Vite dev server port
        "https://beeyield.com",
        "https://www.beeyield.com",
        "https://beeyield.vercel.app",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        return v

    # ============ SUPABASE (Primary Database) ============
    # Fixed: Accept both VITE_SUPABASE_URL and SUPABASE_URL
    SUPABASE_URL: str = Field(default="")
    SUPABASE_KEY: str = Field(default="")
    SUPABASE_ANON_KEY: Optional[str] = Field(default=None)
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = Field(default=None)
    SUPABASE_JWT_SECRET: Optional[str] = None

    # Shop specific
    SUPABASE_URL_SHOP: Optional[str] = Field(default=None)
    SUPABASE_KEY_SHOP: Optional[str] = Field(default=None)
    SUPABASE_SERVICE_ROLE_KEY_SHOP: Optional[str] = Field(default=None)

    # BeeYield specific
    SUPABASE_URL_BEEYIELD: Optional[str] = Field(default=None)
    SUPABASE_KEY_BEEYIELD: Optional[str] = Field(default=None)
    SUPABASE_SERVICE_ROLE_KEY_BEEYIELD: Optional[str] = Field(default=None)

    # CEBA specific
    SUPABASE_URL_CEBA: Optional[str] = Field(default=None)
    SUPABASE_KEY_CEBA: Optional[str] = Field(default=None)
    SUPABASE_SERVICE_ROLE_KEY_CEBA: Optional[str] = Field(default=None)
    
    OPENAI_API_KEY: Optional[str] = Field(default=None)
    GOOGLE_API_KEY: Optional[str] = Field(default=None)
    
    # Postgres direct connection (for migrations/legacy sqlalchemy)
    POSTGRES_URL: Optional[str] = Field(default=None)




    # ============ AUTHENTICATION ============
    SECRET_KEY: str = "beeyield-super-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # ============ PAYMENTS ============
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    
    MPESA_CONSUMER_KEY: Optional[str] = None
    MPESA_CONSUMER_SECRET: Optional[str] = None
    MPESA_PASSKEY: Optional[str] = None
    MPESA_BUSINESS_SHORTCODE: Optional[str] = None
    MPESA_CALLBACK_URL: Optional[str] = None
    SIMULATE_MPESA: bool = False

    # ============ EMAIL (Resend) ============
    RESEND_API_KEY: Optional[str] = None
    EMAIL_FROM_ADDRESS: str = "noreply@beeyield.com"
    EMAIL_FROM_NAME: str = "BeeYield"

    # ============ FILE STORAGE ============
    STORAGE_BUCKET_RESUMES: str = "resumes"
    STORAGE_BUCKET_PRODUCTS: str = "product-images"
    STORAGE_BUCKET_MEDIA: str = "media"

    # ============ BLOCKCHAIN ============
    BLOCKCHAIN_URL: Optional[str] = None
    BLOCKCHAIN_CONTRACT_ADDRESS: Optional[str] = None
    BLOCKCHAIN_PRIVATE_KEY: Optional[str] = None
    BLOCKCHAIN_ACCOUNT: Optional[str] = None

    # ============ APP SETTINGS ============
    APP_URL: str = "http://localhost:5173"
    API_URL: str = "http://localhost:8000"
    DB_GATEWAY_URL: str = "http://localhost:9090"
    DEBUG: bool = True

    # Checkouts
    ADMIN_BYPASS_PHONE: Optional[str] = None  # e.g. "2547..."
    ADMIN_EMAIL: str = "timothynduva349@gmail.com"
    TOTAL_HARVEST_LIMIT_GRAMS: int = 60000

    # ============ ETIMS (KRA Compliance) ============
    ETIMS_API_KEY: Optional[str] = None
    ETIMS_BASE_URL: str = "https://etims-sandbox.kra.go.ke/api/v1"
    ETIMS_VSCU_SERIAL: str = "BY-VSCU-MOCK-2026"

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
