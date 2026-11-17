from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork

__all__ = ["CategoriaNoEncontrada", "ProductoNoEncontrado", "ProductoService"]


class ProductoNoEncontrado(Exception):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def _validar_categoria(self, uow: ProductoUnitOfWork, categoria_id: int) -> None:
        cat = uow.categorias.get_by_id(categoria_id)
        if cat is None or not cat.activo:
            raise CategoriaNoEncontrada()

    def _get_activo(self, uow: ProductoUnitOfWork, id: int) -> Producto:
        p = uow.productos.get_by_id(id)
        if p is None or not p.activo:
            raise ProductoNoEncontrado()
        return p

    def listar(
        self,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
        skip: int,
        limit: int,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search(
                search=search, categoria_id=categoria_id, disponible=disponible, skip=skip, limit=limit
            )
            return ProductosPaginados(total=total, items=[ProductoRead.model_validate(p) for p in items])

    def obtener(self, id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._get_activo(uow, id))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._validar_categoria(uow, data.categoria_id)
            p = uow.productos.add(Producto.model_validate(data))
            return ProductoRead.model_validate(p)

    def actualizar(self, id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            p = self._get_activo(uow, id)
            cambios = data.model_dump(exclude_unset=True, exclude_none=True)
            if "categoria_id" in cambios:
                self._validar_categoria(uow, cambios["categoria_id"])
            for campo, valor in cambios.items():
                setattr(p, campo, valor)
            uow.productos.add(p)
            return ProductoRead.model_validate(p)

    def actualizar_stock(self, id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            p = self._get_activo(uow, id)
            p.stock = data.stock
            p.disponible = data.disponible
            uow.productos.add(p)
            return ProductoRead.model_validate(p)

    def eliminar(self, id: int) -> None:
        with self.uow as uow:
            p = self._get_activo(uow, id)
            p.activo = False
            uow.productos.add(p)
