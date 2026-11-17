from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.models import Categoria
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.models import Producto
from app.modules.productos.repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    productos: ProductoRepository
    categorias: CategoriaRepository

    def _init_repositories(self) -> None:
        self.productos = ProductoRepository(self.session, Producto)
        self.categorias = CategoriaRepository(self.session, Categoria)
