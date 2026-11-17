from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(Exception):
    pass


class AutoDesactivacion(Exception):
    pass


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.get_all_ordenados()]

    def activar(self, id: int) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(id)
            if usuario is None:
                raise UsuarioNoEncontrado()
            usuario.disabled = False
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def desactivar(self, id: int, actual_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(id)
            if usuario is None:
                raise UsuarioNoEncontrado()
            if id == actual_id:
                raise AutoDesactivacion()
            usuario.disabled = True
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)
