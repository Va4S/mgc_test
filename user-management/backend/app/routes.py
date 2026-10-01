# Маршруты: вход в систему и управление пользователями.
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from .db import get_db
from .models import User
from .schemas import LoginRequest, TokenOut, UserCreate, UserOut, UserPage, UserUpdate
from .security import create_token, hash_password, read_token, verify_password

router = APIRouter(prefix="/api")
bearer = HTTPBearer(auto_error=False)


def current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    user_id = read_token(creds.credentials) if creds else None
    user = db.get(User, user_id) if user_id else None
    if not user:
        raise HTTPException(401, "Требуется вход в систему")
    return user


def admin_only(user: User = Depends(current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(403, "Недостаточно прав")
    return user


@router.post("/auth/login", response_model=TokenOut)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.login == data.login))
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Неверный логин или пароль")
    return {"token": create_token(user.id), "user": user}


@router.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(current_user)):
    return user


@router.get("/users", response_model=UserPage)
def list_users(
    page: int = 1,
    page_size: int = 20,
    search: str = "",
    _: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    query = select(User)
    if search.strip():
        mask = f"%{search.strip()}%"
        query = query.where(or_(User.login.ilike(mask), User.full_name.ilike(mask)))
    total = db.scalar(select(func.count()).select_from(query.subquery()))
    items = db.scalars(
        query.order_by(User.full_name, User.id).limit(page_size).offset((page - 1) * page_size)
    ).all()
    return {"items": items, "total": total}


@router.post("/users", response_model=UserOut, status_code=201)
def create_user(data: UserCreate, _: User = Depends(admin_only), db: Session = Depends(get_db)):
    if db.scalar(select(User.id).where(User.login == data.login)):
        raise HTTPException(409, "Пользователь с таким логином уже существует")
    user = User(
        login=data.login,
        full_name=data.full_name,
        role=data.role,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    data: UserUpdate,
    admin: User = Depends(admin_only),
    db: Session = Depends(get_db),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "Пользователь не найден")
    if data.role and user.id == admin.id and data.role != "admin":
        raise HTTPException(400, "Нельзя снять роль администратора с самого себя")
    if data.login and data.login != user.login:
        if db.scalar(select(User.id).where(User.login == data.login)):
            raise HTTPException(409, "Пользователь с таким логином уже существует")
        user.login = data.login
    if data.full_name:
        user.full_name = data.full_name
    if data.role:
        user.role = data.role
    if data.password:
        user.password_hash = hash_password(data.password)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: int, admin: User = Depends(admin_only), db: Session = Depends(get_db)):
    if user_id == admin.id:
        raise HTTPException(400, "Нельзя удалить самого себя")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "Пользователь не найден")
    db.delete(user)
    db.commit()
