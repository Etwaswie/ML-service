from sqlalchemy import Column, Integer, DateTime, Boolean, ForeignKey, String
from sqlalchemy.sql import func
from database import Base

class Predictions(Base):
    __tablename__ = 'predictions'

    prediction_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    model_id = Column(Integer, ForeignKey('models.model_id'), nullable=False)
    prediction_date = Column(DateTime(timezone=True), server_default=func.now())
    prediction_result =  Column(String(255), nullable=False)