import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, engine, Base
from routers import user as UserRouter
from routers import admin as AdminRouter
from routers import models as ModelsRouter
from models.user import create_default_admin

Base.metadata.create_all(bind=engine)
app = FastAPI(
    #docs_url=None, # Disable docs (Swagger UI)
    #redoc_url=None, # Disable redoc
)

@app.on_event("startup")
async def startup_event():
    db = SessionLocal()
    create_default_admin(db)
    db.close()


origins = [
    "http://localhost",
    "http://localhost:3000",  # React
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(UserRouter.router, prefix="/api/user")
app.include_router(AdminRouter.router, prefix="/api/admin")
app.include_router(ModelsRouter.router, prefix="/api/models")

if __name__ == '__main__':
    uvicorn.run("main:app", host='0.0.0.0', port=8000, reload=True, workers=3)
