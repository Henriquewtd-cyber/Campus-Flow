
from fastapi import APIRouter
from app.validation.validation_service import get_pendent_events
from app.automation.automation_schema import EventPendentDB
router = APIRouter()

@router.get("/validate", response_model=list[EventPendentDB])
def validate():
    return get_pendent_events()
