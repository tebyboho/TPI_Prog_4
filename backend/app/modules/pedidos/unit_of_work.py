from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.models import Pedido
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.models import Producto
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    pedidos: PedidoRepository
    productos: ProductoRepository

    def _init_repositories(self) -> None:
        self.pedidos = PedidoRepository(self.session, Pedido)
        self.productos = ProductoRepository(self.session, Producto)
