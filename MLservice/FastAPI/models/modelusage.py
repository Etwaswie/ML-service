from sqlalchemy import Column, Integer, DateTime, Boolean, ForeignKey, String
from sqlalchemy.sql import func
from database import Base

class ModelUsage(Base):
    __tablename__ = 'model_usage'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    model_id = Column(Integer, ForeignKey('models.model_id'), nullable=False)
    remaining_usages = Column(Integer, default=0) 
    