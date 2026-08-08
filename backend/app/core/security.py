

from jose import jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from app.core.settings import settings

SECRET_KEY = settings.SECRET_KEY  
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"])

def create_access_token(data: dict) -> str: # cria o token JWT com os dados do usuário e a expiração
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=24)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict: # verifica o token JWT 
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

def hash_password(password: str) -> str: # gera o hash da senha usando bcrypt
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool: # verifica se a senha fornecida corresponde ao hash armazenado
    return pwd_context.verify(plain, hashed)