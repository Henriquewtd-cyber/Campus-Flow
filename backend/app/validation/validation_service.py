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

            if not isinstance(dados_brutos, dict):
                continue

            try:
                dados_evento = dados_brutos.get("evento")

                if not isinstance(dados_evento, dict):
                    print(f"Evento pendente {event.id} não contém dados válidos.")
                    continue

                evento = Event.model_validate(dados_evento)

            except Exception as e:
                print(f"Erro ao validar evento {event.id}: {e}")
                continue

            resultado.append({
                "id": event.id,
                "dados_brutos": dados_brutos,
                "evento": evento.model_dump(mode="json"),
                "sugestoes": dados_brutos.get("sugestoes"),
                "erros_validacao": event.erros_validacao,
                "email_id": event.email_id,
            })

        return resultado

    finally:
        db.close()
