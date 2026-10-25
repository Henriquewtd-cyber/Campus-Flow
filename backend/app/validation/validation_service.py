from app.db.database_models import Evento_Pendente
from app.db.database import SessionLocal
from app.events.event_schema import Event


def get_pendent_events():
    db = SessionLocal()

    try:
        events = db.query(Evento_Pendente).all()
        resultado = []

        for event in events:
            dados_brutos = event.dados_brutos

            if (
                not isinstance(dados_brutos, dict)
                or dados_brutos.get("eventoEncontrado") is not True
                or not isinstance(dados_brutos.get("evento"), dict)
            ):
                continue

            evento = Event.model_validate(dados_brutos["evento"])

            resultado.append({
                "id": event.id,
                "dados_brutos": dados_brutos,
                "evento": evento.model_dump(mode="json"),
            })

        return resultado

    finally:
        db.close()