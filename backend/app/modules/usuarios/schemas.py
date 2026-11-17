from datetime import datetime

from pydantic import EmailStr
from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    username: str = Field(min_length=3)
    full_name: str
    email: EmailStr
    password: str = Field(min_length=8)


class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
