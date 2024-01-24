from sqlalchemy.orm import Session
from sqlalchemy import desc
from models.models import Models
import os
import pickle
from fastapi import HTTPException
from dto import models as ModelsDto

def is_valid_pkl_content(file_content):
    try:
        pickle.loads(file_content)
        return True
    except pickle.UnpicklingError:
        return False


def save_uploaded_model(model_file):
    allowed_extensions = {'.pkl'}
    file_extension = os.path.splitext(model_file.filename)[1]
    if file_extension.lower() not in allowed_extensions:
        raise HTTPException(status_code=422, detail="Разрешены только файлы с расширением .pkl")
    # Здесь вы можете определить логику сохранения файла
    # Например, сохранить в папку "uploads" и вернуть путь к файлу
    # Пожалуйста, адаптируйте под свои потребности
    upload_folder = "MLmodels"
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    file_path = os.path.join(upload_folder, model_file.filename)
    file_content = model_file.file.read()
    if not is_valid_pkl_content(file_content):
        raise HTTPException(status_code=422, detail="Содержимое файла не соответствует формату .pkl")
    
    with open(file_path, 'wb') as f:
        f.write(file_content)

    return file_path

def remove_model(db: Session, model_id: int):
    file_path = db.query(Models).filter(Models.model_id==model_id).first().model_file_path
    delete_result = db.query(Models).filter(Models.model_id==model_id).delete()
    db.commit()
    try:
        # Удаляем файл по полученному пути
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        # Если возникла ошибка при удалении файла, вы можете обработать ее или просто залогировать
        print(f"Ошибка при удалении файла {file_path}: {e}")
    return delete_result

def create_model(db: Session, model_name: str, model_description: str, file_path: str, model_price:int):
    if model_price <= 0:
        raise HTTPException(status_code=400, detail="Пополнение возможно только при указании положительного числа")
    model = Models(model_name=model_name, model_description=model_description, model_file_path=file_path, model_price=model_price)
    db.add(model)
    db.commit()
    db.refresh(model)
    return model