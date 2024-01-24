# ML-service
Данный проект представляет собой ML-сервис с биллинговой системой. Конечной целью сервиса является:
- для администраторов возможность загружать модели для предикта на тестовых данных пользователей, устанавливать стоимость одного предсказания конкретной модели
- для пользователей возможность покупать использования, выбирать модель из списка всех имеющихся, загружать в нее данные и получать на выходе предсказания

## Как использовать сервис
Для получения предсказания, является ли описанный момент аномалией, пользователю необходимо зарегистрироваться в сервисе, выбрать ML-модель из списка загруженных администратором и загрузить .csv-файл с данными.
В данный момент пользователи сами могут пополнять себе баланс, в дальнейшем такая возможность будет только у администратора.

По пути 
`
./ipnbs/ML_services.ipynb
`
можно ознакомиться с EDA и получением ML-моделей (LogisticRegression, SVC, KNeighborsClassifier).
В папке 
`
./models
`
находятся модели в формате .pkl, а в папке
`
./data
`
исходные данные для анализа.

## Запуск сервиса
В папке проекта запустить PowerShell и выполнить команды:
- `
docker-compose build
`
 
- `
docker-compose up
`

Сервис будет доступен на 3000 порту
`
http://localhost:3000
`

Swagger доступен по адресу
`
http://localhost:8000/docs
`

## Сервис в картинках
Авторизация: ![image](https://github.com/Etwaswie/ML-service/assets/48685561/48f10cc8-e05c-434d-b546-54ad99bc3c76)
Регистрация: ![image](https://github.com/Etwaswie/ML-service/assets/48685561/7e71120e-e9d0-4696-8992-6b9cae8416d1)
ЛК администратора: ![image](https://github.com/Etwaswie/ML-service/assets/48685561/301af62c-1f18-44c6-8d80-977efef0b1c9)
Страница с доступными моделями: ![image](https://github.com/Etwaswie/ML-service/assets/48685561/abd913e7-a5a0-45c0-975f-12ca0c74b1ae)
Покупка использований модели пользователем: ![image](https://github.com/Etwaswie/ML-service/assets/48685561/4b969589-d772-41e9-bfbf-065bc3490cf5)

## Использованные технологии:
- Для предварительного анализа данных использовались библиотеки pandas и numpy, для визуализации seaborn и matplotlib, для обучения моделей библиотека sklearn
- Бэкенд: веб-фреймворк FastAPI, uvicorn
- Фронтенд: React, фреймворк Bootstrap
- Для работы с СУБД SQLite использовалась библиотека SQLAlchemy

## Схема базы данных
![image](https://github.com/Etwaswie/ML-service/assets/48685561/f5436990-fc69-4fa2-8e7e-57dd92d12be0)
