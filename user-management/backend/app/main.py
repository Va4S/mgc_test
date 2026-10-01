# Точка входа: создание таблиц, первый администратор и запуск API.
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import select
from sqlalchemy.exc import OperationalError

from .config import ADMIN_LOGIN, ADMIN_PASSWORD
from .db import Base, SessionLocal, engine
from .models import User
from .routes import router
from .security import hash_password


def prepare_database():
    # База может запускаться чуть дольше сервера, поэтому делаем несколько попыток
    for _ in range(30):
        try:
            Base.metadata.create_all(engine)
            break
        except OperationalError:
            time.sleep(2)
    else:
        raise RuntimeError("База данных недоступна")

    with SessionLocal() as db:
        if not db.scalar(select(User.id).where(User.login == ADMIN_LOGIN)):
            db.add(
                User(
                    login=ADMIN_LOGIN,
                    full_name="Администратор",
                    role="admin",
                    password_hash=hash_password(ADMIN_PASSWORD),
                )
            )
            db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    prepare_database()
    yield


app = FastAPI(title="Управление пользователями", lifespan=lifespan)
app.include_router(router)
