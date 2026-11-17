from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import require_role
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import AutoDesactivacion, UsuarioNoEncontrado, UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=list[UserPublic])
def listar_usuarios(
    _: UserPublic = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
) -> list[UserPublic]:
    return service.listar()


@router.post("/{id}/activar", response_model=UserPublic)
def activar_usuario(
    id: int,
    _: UserPublic = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
) -> UserPublic:
    try:
        return service.activar(id)
    except UsuarioNoEncontrado:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")


@router.post("/{id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    id: int,
    actual: UserPublic = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
) -> UserPublic:
    try:
        return service.desactivar(id, actual.id)
    except UsuarioNoEncontrado:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    except AutoDesactivacion:
        raise HTTPException(status_code=400, detail="No podés desactivar tu propia cuenta")
