
import token

from sqlalchemy.orm import Session
from app.db.database_models import Usuario
from app.core.security import verify_password, create_access_token
from app.db.database import SessionLocal
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

async def get_user(email: str, password: str):
    try:
        db = SessionLocal()

        user = db.query(Usuario).filter(
            Usuario.email == email
        ).first()
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error occurred while fetching user"
        )

    finally:
        db.close()

    print(f"User fetched from database: {user}")

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    token = create_access_token({
    "sub": user.email,
    "role": user.role,
    "name": user.name,
    "id": user.id

    })

    response = JSONResponse({
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "name": user.name,
        }
    })

    

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/"
    )

    return response
    
    