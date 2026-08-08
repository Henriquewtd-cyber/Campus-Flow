
from fastapi import FastAPI
from pydantic import BaseModel
from app.db.database import Base, engine
from app.models.database_models import Usuario, Evento

from app.routes.user import router as users_router
from app.routes.event import router as events_router

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    tax: float | None = None



Base.metadata.create_all(bind=engine)

app.include_router(users_router)
app.include_router(events_router)