
from fastapi import APIRouter, HTTPException
from app.schemas.event import Event, EventResponse
from app.services import event_service

router = APIRouter()

@router.post("/add_evento", response_model=EventResponse)
async def add_evento(event: Event):
    # aqui a ideia é usar o event_service para adicionar o evento e retornar uma resposta.
    return await event_service.add_evento(event)

