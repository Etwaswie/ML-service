from pydantic import BaseModel
from datetime import datetime

class CreateTransactionRequest(BaseModel):
    model_id:int
    transaction_amount: int

class GetUserTransactions(BaseModel):
    user_id: int
    model_id:int
    transaction_amount: int
    transaction_date: datetime
