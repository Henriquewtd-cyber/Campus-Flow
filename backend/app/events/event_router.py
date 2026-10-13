
from fastapi import APIRouter, Depends, HTTPException
from app.events.event_schema import Event, EventResponse
from app.events import event_service
from app.auth.user_dependencies import get_current_user

router = APIRouter()

@router.post("/add_evento", response_model=EventResponse)
async def add_evento(event: Event, current_user: dict = Depends(get_current_user)):
    # aqui a ideia é usar o event_service para adicionar o evento e retornar uma resposta.
    return await event_service.add_evento(event)

