from sqlalchemy import Column, Integer, String, DateTime
from .database import Base
from datetime import datetime

class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    batch_id_str = Column(String, unique=True, index=True)
    beekeeper = Column(String)
    location = Column(String)
    harvest_date = Column(DateTime, default=datetime.utcnow)
    blockchain_tx_hash = Column(String, nullable=True)
