

from sqlalchemy import Column, Integer, String, Boolean
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
    # modelo de evento para o banco de dados, usando SQLAlchemy
    __tablename__ = "eventos"
    id = Column(Integer, primary_key=True)
    dataInicio = Column(String(20))
    dataFim = Column(String(20), nullable=True)
    destaque = Column(Boolean)
    fonte = Column(String(255))
    horaFim = Column(String(10), nullable=True)
    horaInicio = Column(String(10), nullable=True)
    link = Column(String(255), nullable=True)
    local = Column(String(255), nullable=True)
    subtitulo = Column(String(255),  nullable=True)
    textoTicker = Column(String(255), nullable=True)
    ticker = Column(Boolean)
    tipo = Column(String(100))
    titulo = Column(String(255))