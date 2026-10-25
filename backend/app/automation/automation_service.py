

from fastapi import HTTPException, status

from app.automation.automation_schema import EventPendentCreate
from app.db.database import SessionLocal
from app.db.database_models import Evento_Pendente


from fastapi import HTTPException, status

# adiciona um evento pendente ao banco de dados, que será validado posteriormente
def n8n_add_pendent_event(event_data: EventPendentCreate):
    db = SessionLocal()

    try:
        event = Evento_Pendente(
            dados_brutos=event_data.dados_brutos,
            erros_validacao=[],
            email_id=event_data.dados_brutos["messageId"],
        )

        db.add(event)
        db.commit()
        db.refresh(event)

        return {
            "status": "success",
            "message": f"Event with ID {event.id} received successfully",
        }

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error occurred while adding event",
        ) from e

    finally:
        db.close()

# Remove um evento pendente do banco de dados, caso exista, baseado no ID fornecido
def n8n_remove_pendent_event(event_id: int):
    db = SessionLocal()

    try:
        event = db.query(Evento_Pendente).filter(Evento_Pendente.id == event_id).first()

        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found",
            )

        db.delete(event)
        db.commit()

        return {
            "status": "success",
            "message": "Event removed successfully",
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error occurred while removing event",
        ) from e

    finally:
        db.close()

def email_is_valid(message_id: str):
    db = SessionLocal()

    try:
        
        result = db.query(Evento_Pendente).filter(Evento_Pendente.email_id == message_id).first() is not None
    
        if result:
            return {
                "status": "success",
                "message": f"Email {message_id} exist in db",
                "result": result
                }
        else:
            return {
                "status": "success",
                "message": f"Email {message_id} doesnt exist in db",
                "result": result
            }
        
    except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error occurred while searching email",
            ) from e
    
    finally:
        db.close()