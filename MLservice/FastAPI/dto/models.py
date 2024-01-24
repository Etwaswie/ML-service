from typing import Optional
from pydantic import BaseModel
from fastapi import UploadFile
from datetime import datetime
from typing import Optional

class GetModels(BaseModel):
    model_id: int
    model_name: str
    model_description: str
    model_file_path: str
    upload_date: Optional[datetime]
    model_price: int
    
    def formatted_upload_date(self):
        if self.upload_date:
            return self.upload_date.strftime("%d/%B/%Y")
        else:
            return None

class ChooseModel(BaseModel):
    model_id: int

class ModelUpload(BaseModel):
    model_description: Optional[str]
    model_file: UploadFile