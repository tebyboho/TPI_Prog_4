from datetime import datetime

from sqlmodel import col, func, select
from sqlmodel.sql.expression import SelectOfScalar

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def _paginar(
        self, query: SelectOfScalar[Pedido], estado: str | None, skip: int, limit: int
    ) -> tuple[int, list[Pedido]]:
        if estado is not None:
            query = query.where(Pedido.estado == estado)
        total = self.session.exec(select(func.count()).select_from(query.subquery())).one()
        items = self.session.exec(query.order_by(col(Pedido.id).desc()).offset(skip).limit(limit)).all()
        return total, list(items)

    def list_by_usuario(
        self, usuario_id: int, estado: str | None, skip: int, limit: int
    ) -> tuple[int, list[Pedido]]:
        return self._paginar(select(Pedido).where(Pedido.usuario_id == usuario_id), estado, skip, limit)

    def list_all(self, estado: str | None, skip: int, limit: int) -> tuple[int, list[Pedido]]:
        return self._paginar(select(Pedido), estado, skip, limit)

    def count_by_estado(self) -> dict[str, int]:
        filas = self.session.exec(select(Pedido.estado, func.count(col(Pedido.id))).group_by(Pedido.estado)).all()
        return {estado: cantidad for estado, cantidad in filas}

    def count_desde(self, desde: datetime) -> int:
        return self.session.exec(select(func.count(col(Pedido.id))).where(Pedido.created_at >= desde)).one()

    def sum_total_por_estado(self, estado: str) -> float:
        query = select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == estado)
        return float(self.session.exec(query).one())
