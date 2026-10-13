
from sqlalchemy.orm import Session
from app.db.database_models import Evento
from app.db.database import SessionLocal
from fastapi import HTTPException, status

async def add_evento(event: Evento):
    db = SessionLocal()

    try:
        event = Evento(
            dataInicio=event.dataInicio,
            dataFim=event.dataFim,
            destaque=event.destaque,
            fonte=event.fonte,
            horaFim=event.horaFim,
            horaInicio=event.horaInicio,
            link=event.link,
            local=event.local,
            subtitulo=event.subtitulo,
            textoTicker=event.textoTicker,
            ticker=event.ticker,
            tipo=event.tipo,
            titulo=event.titulo
        )

        db.add(event)
        db.commit()
        db.refresh(event)
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error occurred while adding event"
        )

    finally:
        db.close()

    return {
        "status": "success",
        "message": f"Event '{event.titulo}' added successfully"
    }
    