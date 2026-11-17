from sqlmodel import SQLModel


class MensajeResponse(SQLModel):
    message: str
