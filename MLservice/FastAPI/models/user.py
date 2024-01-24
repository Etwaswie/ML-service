from sqlalchemy import Column, Integer, String
from database import Base
from passlib.context import CryptContext


bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    balance = Column(Integer, default=0)
    role = Column(String, default='user')
    hashed_password = Column(String)


def create_default_admin(db):
    existing_admin = db.query(User).filter(User.role == 'admin').first()
    if not existing_admin:
        default_admin_data = {
            "username": "admin",
            "hashed_password": bcrypt_context.hash("password"),  # Хэшируем пароль
            "role": "admin"
        }
        user = User(**default_admin_data)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user