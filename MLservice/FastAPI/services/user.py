from models.user import User
from models.models import Models
from models.modelusage import ModelUsage
from models.transactions import Transaction
from models.predictions import Predictions
from sqlalchemy.orm import Session
from dto import user as UserDto
from dto import models as ModelsDto
from dto import transactions as TransactionsDto
from dto import modelsusage as ModelsUsageDto
from dto import predictions as PredictionsDto
from sqlalchemy import desc
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from datetime import timedelta, datetime
from jose import jwt, JWTError
from typing import Annotated
from fastapi import Depends
from fastapi import APIRouter, Depends, HTTPException
from starlette import status

SECRET_KEY = 'LOVEKUPLINOV'
ALGORITHM = 'HS256'

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
oauth2_bearer = OAuth2PasswordBearer(tokenUrl='api/user/token')

def create_user(create_data_request: UserDto.CreateUserRequest, db: Session):
    user = db.query(User).filter(User.username == create_data_request.username).first()
    if user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Пользователь с таким именем уже существует')
    user = User(username=create_data_request.username, hashed_password=bcrypt_context.hash(create_data_request.password))
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except Exception as e:
        print(e)

    return user

def auth_user(username: str, password: str, db):
    user = db.query(User).filter(User.username == username).first()
    print(user)
    if not user:
        return False
    if not bcrypt_context.verify(password, user.hashed_password):
        return False
    return user

def create_access_token(username: str, user_id: int, role: str , expires_delta: timedelta):
    encode = {'sub': username, 'id': user_id, 'role': role}
    expires = datetime.utcnow() + expires_delta
    encode.update({'exp': expires})
    return jwt.encode(encode, SECRET_KEY, ALGORITHM)
    
def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get('sub')
        user_id: str = payload.get('id')
        user_role: str = payload.get('role')
        if username is None or user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail='Не получилось подтвердить пользователя.')
        return {'name': username, 'id': user_id, 'role': user_role}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail='Не получилось подтвердить пользователя.')

# def remove(db: Session, id: int):
#     user = db.query(User).filter(User.id==id).delete()
#     db.commit()
#     return user

def get_models_list(db: Session):
    models = db.query(Models).order_by(desc(Models.upload_date)).all()
    return [ModelsDto.GetModels(
        model_id=model.model_id,
        model_name=model.model_name,
        model_description=model.model_description,
        model_file_path=model.model_file_path,
        upload_date=model.upload_date,
        model_price=model.model_price
    ) for model in models]

# Получение баланса
def get_balance(user: str, db: Session):
    user_balance = db.query(User).filter(User.id==user.get('id')).first().balance
    return {'balance': user_balance}

# Пополнение баланса
def user_balance_add(user: str, amount: int, db: Session):
    if amount.amount <= 0:
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Пополнение возможно только при указании положительного числа")
    db_user = db.query(User).filter(User.id==user.get('id')).first()
    user_balance = db_user.balance
    db_user.balance = user_balance + amount.amount
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"user_balance": user_balance + amount.amount}

# Оплата
def buy_model_access(user: str, transaction_request: str, db: Session):
    db_user = db.query(User).filter(User.id==user.get('id')).first()
    db_model = db.query(Models).filter(Models.model_id==transaction_request.model_id).first()
    if db_model is None or db_model is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail='Модель не найдена')
    if transaction_request.transaction_amount <=0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail='transaction_amount должно быть больше 0')
    transaction_price = transaction_request.transaction_amount * db_model.model_price
    if db_user.balance < transaction_price:
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Недостаточно средств!")
    user_balance = db_user.balance
    db_user.balance = user_balance - transaction_price
    transaction = Transaction(user_id=user.get('id'), model_id=db_model.model_id, transaction_amount=int(transaction_request.transaction_amount))
    db_usages = db.query(ModelUsage).filter(ModelUsage.user_id==user.get('id')).filter(ModelUsage.model_id==transaction_request.model_id).first()
    if db_usages is None:
        modelusages = ModelUsage(user_id=user.get('id'), model_id=transaction_request.model_id, remaining_usages=transaction_request.transaction_amount)
        try:
            db.add(modelusages)
            db.commit()
            db.refresh(modelusages)
        except Exception as e:
            print(e)
    else:
        usages = db_usages.remaining_usages
        db_usages.remaining_usages = usages + transaction_request.transaction_amount
        try:
            db.add(db_usages)
            db.commit()
            db.refresh(db_usages)
        except Exception as e:
            print(e)

    try:
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    except Exception as e:
        print(e)
    return {"status": "success"}

def get_user_transactions(user: str, db: Session):
    transactions = db.query(Transaction).filter(Transaction.user_id==user.get('id')).all()
    return [TransactionsDto.GetUserTransactions(
        user_id=transaction.user_id,
        model_id=transaction.model_id,
        transaction_amount=transaction.transaction_amount,
        transaction_date=transaction.transaction_date
    ) for transaction in transactions]

def get_remaining_model_usages(user: str, db: Session):
    models_usages = db.query(ModelUsage).filter(ModelUsage.user_id==user.get('id')).order_by(desc(ModelUsage.remaining_usages)).all()
    return [ModelsUsageDto.GetUserUsages(
        user_id=model.user_id,
        model_id=model.model_id,
        remaining_usages=model.remaining_usages
    ) for model in models_usages]

def get_user_predictions(user: str, db: Session):
    user_predictions = db.query(Predictions).filter(Predictions.user_id==user.get('id')).order_by(desc(Predictions.prediction_date)).all()
    return [PredictionsDto.GetUserPredictions(
        user_id=prediction.user_id,
        prediction_id=prediction.prediction_id,
        prediction_date=prediction.prediction_date,
        prediction_result=prediction.prediction_result
    ) for prediction in user_predictions]