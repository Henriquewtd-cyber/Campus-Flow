from fastapi import APIRouter, Depends, HTTPException, Query
from app.slider import slide_service
from app.events.event_schema import Event

router = APIRouter()

@router.get("/get_slides", response_model=list[Event])
def get_slides():
    return slide_service.get_slides()