
# scripts/criar_eventos.py
from app.db.database import SessionLocal
from app.models.database_models import Evento

db = SessionLocal()
evento = Evento(
    dataInicio="2023-10-10",
    dataFim=None,
    destaque=True,
    fonte="Fonte 1",
    horaFim=None,
    horaInicio=None,
    link=None,
    local=None,
    subtitulo=None,
    textoTicker=None,
    ticker=True,
    tipo="Tipo 1",
    titulo="Título 1"
)

db.add(evento)
db.commit()
db.close()

print("Evento criado!")