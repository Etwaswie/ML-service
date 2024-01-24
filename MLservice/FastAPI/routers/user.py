from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from starlette import status
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from datetime import timedelta, datetime
from services import user as UserService
from dto import user as UserDto
from dto import transactions as TransactionsDto

router = APIRouter()

#Создание пользователя
@router.post('/', tags=["user"], status_code=status.HTTP_201_CREATED)
async def create(db: Session = Depends(get_db),
                 create_user_request: UserDto.CreateUserRequest = None):
    return UserService.create_user(create_user_request, db)

# Получаем токен
@router.post("/token", tags=["authCheck"], response_model=UserDto.Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                                 db: Session = Depends(get_db)):
    user = UserService.auth_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail='Не получилось подтвердить пользователя')
    token = UserService.create_access_token(user.username, user.id, user.role, timedelta(minutes=60))

    return {'access_token': token, 'token_type': 'bearer'}
    
user_dependency = Annotated[dict, Depends(UserService.get_current_user)]

# Проверка аутентификации
@router.get('/', tags=["user"], status_code=status.HTTP_200_OK)
async def user(user: user_dependency, db: Session = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=401, detail='Аутентификация провалена.')
    return {"User": user}

# Проверка баланса
@router.get('/balance', tags=["user_money"], status_code=status.HTTP_200_OK)
async def balance(user: user_dependency, db: Session = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=401, detail='Аутентификация провалена.')
    return UserService.get_balance(user, db)
    

#Пополнение баланса
@router.put('/add_money', tags=["user_money"])
async def add_money(user: user_dependency, data: UserDto.UserBalanceUpdate = None, db: Session = Depends(get_db)):
    return UserService.user_balance_add(user, data, db)

@router.get('/transactions', tags=["user_money"])
async def get_transactions(user: user_dependency, db: Session = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=401, detail='Вы не авторизованы.')
    return UserService.get_user_transactions(user, db)

@router.post('/transactions', tags=["user_money"])
async def buy_model_access(user: user_dependency, create_transaction_request: TransactionsDto.CreateTransactionRequest, db: Session = Depends(get_db)):
    return UserService.buy_model_access(user, create_transaction_request, db)

# @router.delete('/{id}', tags=["user"])
# async def delete(id: int = None, db: Session = Depends(get_db)):
#     return UserService.remove(db, id)

@router.get('/model_usages', tags=["models_usage"])
async def get_models_usages(user: user_dependency, db: Session = Depends(get_db)):
    return UserService.get_remaining_model_usages(user, db)

@router.get('/predictions', tags=["predictions"])
async def get_user_predictions(user: user_dependency, db: Session = Depends(get_db)):
    return UserService.get_user_predictions(user, db)