from pydantic import BaseModel
from datetime import datetime


class GetUserPredictions(BaseModel):
    user_id: int
    prediction_id:int
    prediction_date: datetime
    prediction_result: str
