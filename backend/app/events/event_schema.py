
from pydantic import BaseModel


class Event(BaseModel):
    dataInicio: str
    dataFim: str | None = None
    destaque: bool
    fonte: str
    horaFim: str | None = None
    horaInicio: str | None = None
    link: str | None = None
    local: str | None = None
    subtitulo: str | None = None
    textoTicker: str | None = None
    ticker: bool
    tipo: str
    titulo: str

class EventResponse(BaseModel):
    status: str
    message: str

    

