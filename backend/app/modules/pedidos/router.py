from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoCancelable,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoNoEncontrado,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/pedidos", tags=["pedidos"])

AJENO = "No tenés permiso sobre este pedido"


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


@router.post("", response_model=PedidoRead, status_code=201)
def crear(
    data: PedidoCreate,
    user: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.crear(user.id, data)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))
    except (ProductoNoDisponible, StockInsuficiente, ProductoRepetido) as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=PedidosPaginados)
def listar(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: EstadoPedido | None = None,
    user: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidosPaginados:
    return service.listar(user, estado, skip, limit)


@router.get("/resumen", response_model=ResumenPedidos)
def resumen(
    _: UserPublic = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
) -> ResumenPedidos:
    return service.resumen()


@router.get("/{id}", response_model=PedidoRead)
def obtener(
    id: int,
    user: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.obtener(id, user)
    except PedidoNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PedidoAjeno:
        raise HTTPException(status_code=403, detail=AJENO)


@router.patch("/{id}/estado", response_model=PedidoRead)
def cambiar_estado(
    id: int,
    data: CambioEstado,
    _: UserPublic = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.cambiar_estado(id, data.estado)
    except PedidoNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))
    except TransicionInvalida as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{id}/cancelar", response_model=PedidoRead)
def cancelar(
    id: int,
    user: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.cancelar(id, user)
    except PedidoNoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PedidoAjeno:
        raise HTTPException(status_code=403, detail=AJENO)
    except PedidoNoCancelable as e:
        raise HTTPException(status_code=400, detail=str(e))
