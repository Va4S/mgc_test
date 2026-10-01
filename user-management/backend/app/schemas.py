# Схемы данных, которыми обмениваются клиент и сервер.
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

Role = Literal["admin", "employee"]
LoginStr = Field(min_length=3, max_length=50, pattern=r"^[A-Za-z0-9_.-]+$")
NameStr = Field(min_length=1, max_length=100)
PasswordStr = Field(min_length=8, max_length=72)


class LoginRequest(BaseModel):
    login: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    login: str
    full_name: str
    role: Role
    created_at: datetime


class UserCreate(BaseModel):
    login: str = LoginStr
    full_name: str = NameStr
    role: Role
    password: str = PasswordStr


class UserUpdate(BaseModel):
    login: Optional[str] = LoginStr
    full_name: Optional[str] = NameStr
    role: Optional[Role] = None
    password: Optional[str] = PasswordStr


class UserPage(BaseModel):
    items: list[UserOut]
    total: int


class TokenOut(BaseModel):
    token: str
    user: UserOut
