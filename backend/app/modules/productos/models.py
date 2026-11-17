from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id")
    nombre: str
    descripcion: str | None = None
    precio_base: float
    imagen_url: str | None = None
    stock: int = 0
    disponible: bool = True
    activo: bool = True

    categoria: "Categoria" = Relationship(back_populates="productos")
    detalles: list["DetallePedido"] = Relationship(back_populates="producto")
