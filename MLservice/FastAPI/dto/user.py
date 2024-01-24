from pydantic import BaseModel

class User(BaseModel):
    username: str
    balance: int

    
class UserBalanceUpdate(BaseModel):
    amount: int

class CreateUserRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str