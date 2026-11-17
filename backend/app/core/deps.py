from collections.abc import Callable

from fastapi import Cookie, Depends, HTTPException

from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


def get_current_user(access_token: str | None = Cookie(default=None)) -> UserPublic:
    if access_token is None:
        raise HTTPException(status_code=401, detail="No autenticado")
    username = decode_access_token(access_token)
    if username is None:
        raise HTTPException(status_code=401, detail="No autenticado")
    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_username(username)
        if usuario is None:
            raise HTTPException(status_code=401, detail="No autenticado")
        return UserPublic.model_validate(usuario)


def get_current_active_user(user: UserPublic = Depends(get_current_user)) -> UserPublic:
    if user.disabled:
        raise HTTPException(status_code=400, detail="Cuenta de usuario desactivada")
    return user


def require_role(roles: list[str]) -> Callable[..., UserPublic]:
    def dependencia(user: UserPublic = Depends(get_current_active_user)) -> UserPublic:
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Permisos insuficientes")
        return user

    return dependencia
