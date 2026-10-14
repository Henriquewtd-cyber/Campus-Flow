
from datetime import date

from pydantic import BaseModel, Field

class Event(BaseModel):
    id: int | None = None
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

    tags: list[str] = Field(default_factory=list)
    publicos: list[str] = Field(default_factory=list)
    areas: list[str] = Field(default_factory=list)
    categorias: list[str] = Field(default_factory=list)

class EventResponse(BaseModel):
    status: str
    message: str

class EventQueryParams(BaseModel):
    data_inicio: date | None = None
    data_fim: date | None = None
    all_tags: list[str] | None = None
    all_publicos: list[str] | None = None
    all_areas: list[str] | None = None
    all_categorias: list[str] | None = None


    

