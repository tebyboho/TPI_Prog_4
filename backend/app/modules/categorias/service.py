from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, id: int) -> CategoriaRead:
        with self.uow as uow:
            cat = uow.categorias.get_by_id(id)
            if cat is None or not cat.activo:
                raise CategoriaNoEncontrada()
            return CategoriaRead.model_validate(cat)

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            # La baja lógica no libera el nombre: se busca entre activas e inactivas.
            if uow.categorias.get_by_nombre(data.nombre) is not None:
                raise NombreDuplicado()
            cat = uow.categorias.add(Categoria(nombre=data.nombre, descripcion=data.descripcion))
            return CategoriaRead.model_validate(cat)

    def actualizar(self, id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            cat = uow.categorias.get_by_id(id)
            if cat is None or not cat.activo:
                raise CategoriaNoEncontrada()
            cambios = data.model_dump(exclude_unset=True, exclude_none=True)
            nuevo_nombre = cambios.get("nombre")
            if nuevo_nombre is not None and nuevo_nombre != cat.nombre:
                otra = uow.categorias.get_by_nombre(nuevo_nombre)
                if otra is not None and otra.id != cat.id:
                    raise NombreDuplicado()
            for campo, valor in cambios.items():
                setattr(cat, campo, valor)
            uow.categorias.add(cat)
            return CategoriaRead.model_validate(cat)

    def eliminar(self, id: int) -> None:
        with self.uow as uow:
            cat = uow.categorias.get_by_id(id)
            if cat is None or not cat.activo:
                raise CategoriaNoEncontrada()
            cat.activo = False
            uow.categorias.add(cat)
