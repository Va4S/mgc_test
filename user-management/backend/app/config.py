# Настройки приложения: все значения берутся из переменных окружения.
import os


def _required(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Не задана переменная окружения {name}")
    return value


DB_USER = _required("POSTGRES_USER")
DB_PASSWORD = _required("POSTGRES_PASSWORD")
DB_NAME = _required("POSTGRES_DB")
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "5432")
DATABASE_URL = f"postgresql+psycopg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

SECRET_KEY = _required("SECRET_KEY")
ADMIN_LOGIN = _required("ADMIN_LOGIN")
ADMIN_PASSWORD = _required("ADMIN_PASSWORD")
TOKEN_LIFETIME_HOURS = int(os.environ.get("TOKEN_LIFETIME_HOURS", "12"))
