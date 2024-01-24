from pydantic import BaseModel
from datetime import datetime


class GetUserUsages(BaseModel):
    user_id: int
    model_id:int
    remaining_usages: int
