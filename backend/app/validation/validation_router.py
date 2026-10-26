
from fastapi import APIRouter, Depends
from app.validation.validation_service import get_pendent_events
from app.automation.automation_schema import EventPendentDB
from app.auth.user_dependencies import get_current_user
router = APIRouter()

@router.get("/validate", response_model=list[EventPendentDB])
def validate(current_user: dict = Depends(get_current_user)):
    return get_pendent_events()
