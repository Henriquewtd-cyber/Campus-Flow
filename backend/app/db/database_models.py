

from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from app.db.database import Base

class Usuario(Base):
    # modelo de usuário para o banco de dados, usando SQLAlchemy
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    email = Column(String(150), unique=True)
    role = Column(String(50))
    hashed_password = Column(String(255))


class Evento(Base):
    __tablename__ = "eventos"
    # modelo de evento para o banco de dados
    id = Column(Integer, primary_key=True, index=True)

    dataInicio = Column(String(20))
    dataFim = Column(String(20), nullable=True)
    destaque = Column(Boolean)
    fonte = Column(String(255))
    horaFim = Column(String(10), nullable=True)
    horaInicio = Column(String(10), nullable=True)
    link = Column(String(255), nullable=True)
    local = Column(String(255), nullable=True)
    subtitulo = Column(String(255), nullable=True)
    textoTicker = Column(String(255), nullable=True)
    ticker = Column(Boolean)
    tipo = Column(String(100))
    titulo = Column(String(255))

    tags = Column(JSONB, nullable=False, default=list)
    publicos = Column(JSONB, nullable=False, default=list)
    areas = Column(JSONB, nullable=False, default=list)
    categorias = Column(JSONB, nullable=False, default=list)



class Evento_Pendente(Base):
    # modelo de evento pendente para o banco de dados, usado para armazenar eventos extraídos pela IA antes da validação
    __tablename__ = "eventos_pendentes"

    id = Column(Integer, primary_key=True, index=True)

    # Dados extraídos pela IA, ainda não validados
    dados_brutos = Column(JSONB, nullable=False)

    erros_validacao = Column(JSONB, nullable=False, default=list)

    # Identificação da origem para evitar importações duplicadas
    email_id = Column(String(255), nullable=True, unique=True)

    criado_em = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    atualizado_em = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )