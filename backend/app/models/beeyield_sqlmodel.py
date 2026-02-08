from typing import Optional, List
from uuid import UUID, uuid4
from datetime import datetime, date
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB

# Shared properties
class ApiaryBase(SQLModel):
    name: str = Field(index=True)
    location_name: Optional[str] = None
    apiary_type: str = Field(default="Permanent")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str = Field(default="active")

class HiveBase(SQLModel):
    hive_code: str = Field(index=True, unique=True)
    hive_type: str = Field(default="Langstroth")
    status: str = Field(default="Active")

class UserProfileBase(SQLModel):
    full_name: Optional[str] = None
    
# Database Models

class Apiary(ApiaryBase, table=True):
    __tablename__ = "apiaries"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="auth.users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    hives: List["Hive"] = Relationship(back_populates="apiary")

class Hive(HiveBase, table=True):
    __tablename__ = "hives"
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    apiary_id: UUID = Field(foreign_key="apiaries.id")
    user_id: UUID = Field(foreign_key="auth.users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    apiary: Optional[Apiary] = Relationship(back_populates="hives")

class UserProfile(UserProfileBase, table=True):
    __tablename__ = "user_profiles"

    # Links directly to Supabase Auth User ID
    id: UUID = Field(primary_key=True, foreign_key="auth.users.id")
    
    # JSONB columns for flexible settings
    preferences: dict = Field(default={}, sa_column=Column(JSONB))
    thresholds: dict = Field(default={}, sa_column=Column(JSONB))
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
