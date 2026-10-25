

from http.client import HTTPException
from fastapi import status
from app.db.database import SessionLocal
from app.db.database_models import Evento


def get_slides():
    db = SessionLocal()

    try:
        query = db.query(Evento)

        query = query.filter(Evento.destaque == True)

        return query.order_by(Evento.dataInicio.asc()).all()

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao buscar eventos",
        )

    finally:
        db.close()