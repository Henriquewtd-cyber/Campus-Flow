
from typing_extensions import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from app.events.event_schema import Event, EventQueryParams, EventResponse
from app.events import event_service
from app.auth.user_dependencies import get_current_user

router = APIRouter()

@router.post("/add_evento", response_model=EventResponse)
def add_evento(event: Event, current_user: dict = Depends(get_current_user)):
    # aqui a ideia é usar o event_service para adicionar o evento e retornar uma resposta.
    return event_service.add_evento(event)

@router.get("/get_eventos", response_model=list[Event])
    # recebe os parâmetros de consulta e retorna a lista de eventos filtrados, usando o event_service. 
def get_eventos(params: Annotated[EventQueryParams, Query()]):
    return event_service.get_eventos(params)

@router.patch("/update_evento/{event_id}", response_model=EventResponse)
def update_evento(event_id: int, event: Event, current_user: dict = Depends(get_current_user)):
    # recebe o ID do evento e atualiza o evento correspondente, usando o event_service.
    return event_service.update_evento(event_id, event)

@router.delete("/delete_evento/{event_id}", response_model=EventResponse)
def delete_evento(event_id: int, current_user: dict = Depends(get_current_user)):
    # recebe o ID do evento e deleta o evento correspondente, usando o event_service.
    return event_service.delete_evento(event_id)