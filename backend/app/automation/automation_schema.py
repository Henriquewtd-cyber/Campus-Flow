
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class EventPendentCreate(BaseModel):
    # Saida do n8n / entrada para o banco de dados
    model_config = ConfigDict(from_attributes=True)
    dados_brutos: dict[str, Any]

    erros_validacao: list[str] = Field(default_factory=list)
    email_id: str | None = None

class EventPendentDB(BaseModel):
    # Entrada para o banco de dados / saída do banco de dados
    model_config = ConfigDict(from_attributes=True)
    id: int
    dados_brutos: dict[str, Any]
    erros_validacao: list[str] = Field(default_factory=list)
    email_id: str | None = None

class EventResponse(BaseModel):
    status: str
    message: str

class EmailIdResponse(BaseModel):
    status: str
    message: str
    result: bool