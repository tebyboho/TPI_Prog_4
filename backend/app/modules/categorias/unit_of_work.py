from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.models import Categoria
from app.modules.categorias.repository import CategoriaRepository


class CategoriaUnitOfWork(UnitOfWork):
    categorias: CategoriaRepository

    def _init_repositories(self) -> None:
        self.categorias = CategoriaRepository(self.session, Categoria)
