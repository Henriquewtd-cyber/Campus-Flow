
import secrets

from fastapi import Header, HTTPException, status
from app.config import get_settings


def verify_n8n_token(
    x_n8n_token: str = Header(...)
):
    token_esperado = get_settings().n8n_api_token

    print(token_esperado)
    if (
        not token_esperado
        or not secrets.compare_digest(
            x_n8n_token.encode("utf-8"),
            token_esperado.encode("utf-8"),
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou não autorizado",
        )

    return True
