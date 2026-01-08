from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Use POSTGRES_URL if available, otherwise fallback to local sqlite
SQLALCHEMY_DATABASE_URL = settings.POSTGRES_URL or "sqlite:///./honey_traceability.db"

# For postgres, we don't need check_same_thread
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

