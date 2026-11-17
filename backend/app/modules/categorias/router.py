from fastapi import APIRouter, Depends, HTTPException, Response

from app.core.deps import require_role
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/categorias", tags=["categorias"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


@router.get("", response_model=list[CategoriaRead])
def listar(service: CategoriaService = Depends(get_categoria_service)) -> list[CategoriaRead]:
    return service.listar()


@router.get("/{id}", response_model=CategoriaRead)
def obtener(id: int, service: CategoriaService = Depends(get_categoria_service)) -> CategoriaRead:
    try:
        return service.obtener(id)
    except CategoriaNoEncontrada:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")


@router.post("", response_model=CategoriaRead, status_code=201)
def crear(
    data: CategoriaCreate,
    _: UserPublic = Depends(require_role(["admin"])),
    service: CategoriaService = Depends(get_categoria_service),
) -> CategoriaRead:
    try:
        return service.crear(data)
    except NombreDuplicado:
        raise HTTPException(status_code=409, detail="Ya existe una categoría con ese nombre")


@router.put("/{id}", response_model=CategoriaRead)
def actualizar(
    id: int,
    data: CategoriaUpdate,
    _: UserPublic = Depends(require_role(["admin"])),
    service: CategoriaService = Depends(get_categoria_service),
) -> CategoriaRead:
    try:
        return service.actualizar(id, data)
    except CategoriaNoEncontrada:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    except NombreDuplicado:
        raise HTTPException(status_code=409, detail="Ya existe una categoría con ese nombre")


@router.delete("/{id}", status_code=204, response_class=Response)
def eliminar(
    id: int,
    _: UserPublic = Depends(require_role(["admin"])),
    service: CategoriaService = Depends(get_categoria_service),
) -> Response:
    try:
        service.eliminar(id)
    except CategoriaNoEncontrada:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return Response(status_code=204)
