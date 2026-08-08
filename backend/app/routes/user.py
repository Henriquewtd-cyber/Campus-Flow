
from fastapi import APIRouter, HTTPException
from app.services import user_service
from app.schemas.user import UserLogin, TokenResponse

router = APIRouter()

@router.post("/users/login", response_model=TokenResponse)
async def get_user(user: UserLogin): 
    # aqui a ideia é usar o user_service para autenticar o usuário e retornar os dados dele junto com o token JWT.
    return await user_service.get_user(user.email, user.password)


