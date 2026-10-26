# Rotas do n8n
from fastapi import APIRouter, Depends
from app.automation.automation_service import n8n_add_pendent_event, n8n_remove_pendent_event, email_is_valid
from app.automation.automation_schema import EventPendentCreate, EventResponse, EmailIdResponse
from app.automation.automation_dependencies import verify_n8n_token


router = APIRouter()

@router.post("/n8n_add_event", dependencies=[Depends(verify_n8n_token)], response_model=EventResponse)
def n8n_add_event(event_data: EventPendentCreate):
    # Função para adicionar um evento do n8n no db
    return n8n_add_pendent_event(event_data)

@router.delete("/n8n_remove_event", dependencies=[Depends(verify_n8n_token)], response_model=EventResponse)
def n8n_remove_event(event_id: int):
    # Função para remover um evento do db vindo do n8n
    return n8n_remove_pendent_event(event_id)

@router.get("/n8n_verify_email_id", dependencies=[Depends(verify_n8n_token)], response_model=EmailIdResponse)
def n8n_verify_email_id(messageId: str):
    # Função para verificar se um email existe no db de pendentes
    return email_is_valid(messageId)