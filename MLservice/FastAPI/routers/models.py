from fastapi import Depends, APIRouter, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from database import get_db
from services import user as UserService
from services import models as ModelsService
from services import admin as AdminService
from starlette import status
from typing import Annotated

router = APIRouter()

user_dependency = Annotated[dict, Depends(UserService.get_current_user)]

@router.get('/', tags=["models"])
async def get_models_list(db: Session = Depends(get_db)):
    models = UserService.get_models_list(db)
    return models

@router.get('/{id}', tags=["models"], status_code=status.HTTP_200_OK)
async def get_model(id: int = None, db: Session = Depends(get_db)):
    db_model = ModelsService.get_model(db, id)
    if db_model is None:
        raise HTTPException(status_code=404, detail='Модель не существует')
    return {"Model": db_model}

@router.delete('/{id}', tags=["models"])
async def delete(current_user: user_dependency, id: int = None, db: Session = Depends(get_db)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Permission denied") 
    return AdminService.remove_model(db, id)

@router.post("/{id}", tags=["models"])
async def get_prediction(
    current_user: user_dependency,
    id: int = None,
    data_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        db_model = ModelsService.get_model(db, id)
        if db_model is None:
            raise HTTPException(status_code=404, detail='Модель не существует')
        prediction = await ModelsService.get_prediction(current_user, db_model, data_file, db)
        return(prediction)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))