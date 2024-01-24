from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Form, APIRouter
from sqlalchemy.orm import Session
from database import get_db
from services import admin as AdminService
from typing import Annotated
from services import user as UserService
from dto import models as ModelsDto


user_dependency = Annotated[dict, Depends(UserService.get_current_user)]

router = APIRouter()

@router.post("/upload_model", tags=["admin"])
async def upload_model(
    current_user: user_dependency,
    model_file: UploadFile = File(...),
    model_description: str = Form(...),
    model_price: int = Form(...),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Permission denied") 
    try:
        file_path = AdminService.save_uploaded_model(model_file)
        AdminService.create_model(db, model_file.filename, model_description, file_path, model_price)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Модель успешно загружена"}


