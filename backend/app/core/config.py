from pydantic_settings import BaseSettings
from typing import List, Optional, Union
from pydantic import AnyHttpUrl, field_validator, Field

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "BeeYield Backend"
    
    # CORS (Cross-Origin Resource Sharing)
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://beeyield.com",
        "https://www.beeyield.com",
        "https://beeyield.vercel.app",
        "https://*.vercel.app",
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
    SUPABASE_URL: str = Field(default="", validation_alias="VITE_SUPABASE_URL")
    SUPABASE_KEY: str = Field(default="", validation_alias="SUPABASE_SERVICE_ROLE_KEY")
    SUPABASE_ANON_KEY: Optional[str] = Field(default=None, validation_alias="VITE_SUPABASE_ANON_KEY")
    SUPABASE_JWT_SECRET: Optional[str] = None
    
    # Postgres direct connection (for migrations/legacy sqlalchemy)
    POSTGRES_URL: Optional[str] = Field(default=None, validation_alias="POSTGRES_URL")


    # ============ CLICKHOUSE (Analytics) ============
    CLICKHOUSE_HOST: str = Field(default="", validation_alias="CLICKHOUSE_HOST")
    CLICKHOUSE_USER: str = "default"
    CLICKHOUSE_PASSWORD: str = ""
    CLICKHOUSE_DATABASE: str = "beeyield_analytics"
    CLICKHOUSE_PORT: int = 8443
    CLICKHOUSE_SECURE: bool = True

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
    DEBUG: bool = True
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
