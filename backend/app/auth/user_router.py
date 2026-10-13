
from fastapi import APIRouter, Depends, HTTPException
from app.auth import user_service
from app.auth.user_schema import UserLogin, TokenResponse, UserResponse
from app.auth.user_dependencies import get_current_user

router = APIRouter()

@router.post("/users/login", response_model=TokenResponse)
async def get_user(user: UserLogin): 
    # aqui a ideia é usar o user_service para autenticar o usuário e retornar os dados dele junto com o token JWT.
    return await user_service.get_user(user.email, user.password)

@router.get("/users/me")
def get_me(
    current_user: UserResponse = Depends(get_current_user)
):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user["name"],
        "role": current_user["role"]
    }
