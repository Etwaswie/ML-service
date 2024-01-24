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

Сервис будет доступен на 3000 порту:
- `
http://localhost:3000
`

Swagger доступен по адресу
`
http://localhost:8000/docs
`


## Использованные технологии:
- Для предварительного анализа данных использовались библиотеки pandas и numpy, для визуализации seaborn и matplotlib, для обучения моделей библиотека sklearn
- Бэкенд: веб-фреймворк FastAPI, uvicorn
- Фронтенд: React, фреймворк Bootstrap
- Для работы с СУБД SQLite использовалась библиотека SQLAlchemy

## Схема базы данных
![image](https://github.com/Etwaswie/ML-service/assets/48685561/f5436990-fc69-4fa2-8e7e-57dd92d12be0)
