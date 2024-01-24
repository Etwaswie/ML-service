from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from database import Base
from sqlalchemy.sql import func


class Transaction(Base):
    __tablename__ = 'transactions'

    transaction_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    model_id = Column(Integer, ForeignKey('models.model_id'), nullable=False)
    transaction_date = Column(DateTime(timezone=True), server_default=func.now())
    transaction_amount = Column(Integer, nullable=False)