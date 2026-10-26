from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    secret_key: str
    database_url: str
    n8n_api_token: str

    class Config:
        env_file = ".env"


def get_settings():
    return Settings()