import pickle
from models.models import Models
from models.modelusage import ModelUsage
from models.predictions import Predictions
from sqlalchemy.orm import Session
import pandas as pd
from fastapi import HTTPException

import os

async def is_valid_csv_content(file):
    try:
        # Пытаемся прочитать файл с использованием pandas
        pd.read_csv(file)
        return True
    except pd.errors.ParserError:
        # Если возникает ошибка при парсинге, файл не является CSV
        return False

async def get_prediction(user: str, model: Models, data_file, db: Session):
    db_modelusages = db.query(ModelUsage).filter(ModelUsage.user_id==user.get('id'), ModelUsage.model_id==model.model_id).first()
    if db_modelusages is None:
        raise HTTPException(status_code=402, detail="Необходимо оплатить использование модели.")
    usages = db_modelusages.remaining_usages
    if usages < 1:
        raise HTTPException(status_code=402, detail="Не осталось использований.")
    allowed_extensions = {'.csv'}
    file_extension = os.path.splitext(data_file.filename)[1]
    if file_extension.lower() not in allowed_extensions:
        raise HTTPException(status_code=422, detail="Разрешены только файлы с расширением .pkl")
    if not is_valid_csv_content(data_file):
        raise HTTPException(status_code=422, detail="Содержимое файла не соответствует формату .csv или является пустым")
    
    with open(model.model_file_path, 'rb') as file:
        loaded_model = pickle.load(file)
    data = pd.read_csv(data_file.file)
    data = data.drop('Unnamed: 0', axis=1)
    prediction = loaded_model.predict(data).tolist()
    db_prediction = Predictions(user_id=user.get('id'), model_id=model.model_id, prediction_result=str(prediction))
    try:
        db.add(db_prediction)
        db.commit()
        db.refresh(db_prediction)
    except Exception as e:
        print(e)
    db_modelusages.remaining_usages = usages - 1
    try:
        db.add(db_modelusages)
        db.commit()
        db.refresh(db_modelusages)
    except Exception as e:
        print(e)
    return {"prediction": str(prediction)}

def get_model(db: Session, id: int):
    model = db.query(Models).filter(Models.model_id==id).first()
    return model

