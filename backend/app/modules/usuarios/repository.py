from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    def get_by_username(self, username: str) -> Usuario | None:
        return self.session.exec(select(Usuario).where(Usuario.username == username)).first()

    def get_by_email(self, email: str) -> Usuario | None:
        return self.session.exec(select(Usuario).where(Usuario.email == email)).first()

    def get_all_ordenados(self) -> list[Usuario]:
        return list(self.session.exec(select(Usuario).order_by(Usuario.id)).all())
