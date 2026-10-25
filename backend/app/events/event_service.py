
from datetime import date, datetime, time, timedelta

from sqlalchemy.orm import Session
from app.db.database_models import Evento
from app.db.database import SessionLocal
from fastapi import HTTPException, status
from app.events.event_schema import Event, EventResponse, EventQueryParams

def add_evento(event: Event) -> EventResponse:
    db = SessionLocal()

    try:

        for i in range(len(event.tags)):
            event.tags[i] = event.tags[i].lower()

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
            titulo=event.titulo,
            tags = event.tags or [],
            publicos=event.publicos or [],
        )

        db.add(event)
        db.commit()
        db.refresh(event)
    
    except Exception as e:
        db.rollback()
        print(e)
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

    
def get_eventos(
    params: EventQueryParams
    ):
    db = SessionLocal()

    try:
        query = db.query(Evento)

        if params.data_inicio:
            inicio = datetime.combine(params.data_inicio, time.min)
            query = query.filter(Evento.dataInicio >= inicio.isoformat())

        if params.data_fim:
            fim_exclusivo = datetime.combine(
                params.data_fim + timedelta(days=1),
                time.min,
            )
            query = query.filter(Evento.dataInicio < fim_exclusivo.isoformat())

        if params.all_tags:
            tags = [tag.lower().strip() for tag in params.all_tags]

            for tag in tags:
                query = query.filter(
                    Evento.tags.op("@>")([tag])
                )

        if params.all_publicos:
            query = query.filter(
                Evento.publicos.op("@>")([params.all_publicos[0]])
            )
            for publico in params.all_publicos[1:]:
                query = query.filter(
                    Evento.publicos.op("@>")([publico])
                )

        if params.all_areas:
            query = query.filter(
                Evento.areas.op("@>")([params.all_areas[0]])
            )
            for area in params.all_areas[1:]:
                query = query.filter(
                    Evento.areas.op("@>")([area])
                )

        if params.all_categorias:
            query = query.filter(
                Evento.categorias.op("@>")([params.all_categorias[0]])
            )
            for categoria in params.all_categorias[1:]:
                query = query.filter(
                    Evento.categorias.op("@>")([categoria])
                )

        return query.order_by(Evento.dataInicio.asc()).all()

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao buscar eventos",
        )

    finally:
        db.close()

def update_evento(event_id: int, event: Event) -> EventResponse:
    db = SessionLocal()

    try:
        existing_event = (
            db.query(Evento)
            .filter(Evento.id == event_id)
            .first()
        )

        if not existing_event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Event with ID {event_id} not found"
            )

        for field, value in event.model_dump(exclude_unset=True).items():
            if field == "tags" and value is not None:
                value = [tag.lower().strip() for tag in value]

            setattr(existing_event, field, value)

        db.commit()
        db.refresh(existing_event)

        return {
            "status": "success",
            "message": f"Event '{existing_event.titulo}' updated successfully"
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        # Registre o erro real no log para facilitar a depuração.
        print(f"Erro ao atualizar evento {event_id}: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao atualizar evento"
        )

    finally:
        db.close()