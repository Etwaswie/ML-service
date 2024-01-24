from sqlalchemy import Column, Integer, String, DateTime
from database import Base
from sqlalchemy.sql import func


class Models(Base):
    __tablename__ = 'models'
    model_id = Column(Integer, primary_key=True)
    model_name = Column(String(255), nullable=False)
    model_description = Column(String(255))
    model_file_path = Column(String(255), nullable=False)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    model_price = Column(Integer, nullable=False)