from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def search(
        self,
        *,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
        skip: int,
        limit: int,
    ) -> tuple[int, list[Producto]]:
        query = select(Producto).where(col(Producto.activo).is_(True))
        if search:
            query = query.where(col(Producto.nombre).ilike(f"%{search}%"))
        if categoria_id is not None:
            query = query.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            query = query.where(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(query.subquery())).one()
        items = self.session.exec(query.order_by(Producto.id).offset(skip).limit(limit)).all()
        return total, list(items)
