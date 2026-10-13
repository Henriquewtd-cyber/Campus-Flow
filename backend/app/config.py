from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    secret_key: str
    database_url: str

    class Config:
        env_file = ".env"


def get_settings():
    return Settings()