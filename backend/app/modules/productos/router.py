from fastapi import APIRouter, Depends, HTTPException, Query, Response

from app.core.deps import require_role
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import CategoriaNoEncontrada, ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/productos", tags=["productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


@router.get("", response_model=ProductosPaginados)
def listar(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
    service: ProductoService = Depends(get_producto_service),
) -> ProductosPaginados:
    return service.listar(search, categoria_id, disponible, skip, limit)


@router.get("/{id}", response_model=ProductoRead)
def obtener(id: int, service: ProductoService = Depends(get_producto_service)) -> ProductoRead:
    try:
        return service.obtener(id)
    except ProductoNoEncontrado:
        raise HTTPException(status_code=404, detail="Producto no encontrado")


@router.post("", response_model=ProductoRead, status_code=201)
def crear(
    data: ProductoCreate,
    _: UserPublic = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return service.crear(data)
    except CategoriaNoEncontrada:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")


@router.put("/{id}", response_model=ProductoRead)
def actualizar(
    id: int,
    data: ProductoUpdate,
    _: UserPublic = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return service.actualizar(id, data)
    except ProductoNoEncontrado:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    except CategoriaNoEncontrada:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")


@router.patch("/{id}/stock", response_model=ProductoRead)
def actualizar_stock(
    id: int,
    data: ProductoStockUpdate,
    _: UserPublic = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return service.actualizar_stock(id, data)
    except ProductoNoEncontrado:
        raise HTTPException(status_code=404, detail="Producto no encontrado")


@router.delete("/{id}", status_code=204, response_class=Response)
def eliminar(
    id: int,
    _: UserPublic = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_producto_service),
) -> Response:
    try:
        service.eliminar(id)
    except ProductoNoEncontrado:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return Response(status_code=204)
