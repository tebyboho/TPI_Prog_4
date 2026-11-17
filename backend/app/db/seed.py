from urllib.parse import quote_plus

from sqlmodel import Session, select

from app.core.database import create_all_tables
from app.core.security import hash_password
from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

USUARIOS = [
    {"username": "admin", "password": "Admin1234!", "full_name": "Administrador",
     "email": "admin@foodstore.com", "role": "admin"},
    {"username": "cliente", "password": "Cliente1234!", "full_name": "Cliente Demo",
     "email": "cliente@foodstore.com", "role": "user"},
]

CATEGORIAS = [
    {"nombre": "Pizzas", "descripcion": "Pizzas a la piedra"},
    {"nombre": "Hamburguesas", "descripcion": "Hamburguesas caseras con papas"},
    {"nombre": "Bebidas", "descripcion": "Bebidas frías"},
    {"nombre": "Postres", "descripcion": "Postres y dulces"},
]

PRODUCTOS = [
    {"categoria": "Pizzas", "nombre": "Pizza Muzzarella", "descripcion": "Salsa de tomate, muzzarella y aceitunas",
     "precio_base": 9500, "stock": 30},
    {"categoria": "Pizzas", "nombre": "Pizza Napolitana", "descripcion": "Muzzarella, tomate en rodajas y ajo",
     "precio_base": 11000, "stock": 25},
    {"categoria": "Hamburguesas", "nombre": "Hamburguesa Clásica", "descripcion": "Carne, lechuga, tomate y queso",
     "precio_base": 8500, "stock": 40},
    {"categoria": "Hamburguesas", "nombre": "Hamburguesa Doble Bacon", "descripcion": "Doble carne, cheddar y bacon",
     "precio_base": 12000, "stock": 20},
    {"categoria": "Bebidas", "nombre": "Gaseosa Cola 500ml", "descripcion": "Botella de 500ml",
     "precio_base": 3500, "stock": 50},
    {"categoria": "Bebidas", "nombre": "Agua Mineral 500ml", "descripcion": "Sin gas, botella de 500ml",
     "precio_base": 3500, "stock": 50},
    {"categoria": "Postres", "nombre": "Flan Casero", "descripcion": "Con dulce de leche y crema",
     "precio_base": 4500, "stock": 15},
    {"categoria": "Postres", "nombre": "Brownie con Helado", "descripcion": "Brownie tibio con bocha de helado",
     "precio_base": 5500, "stock": 10},
]


def seed_usuarios(session: Session) -> None:
    for d in USUARIOS:
        existe = session.exec(select(Usuario).where(Usuario.username == d["username"])).first()
        if existe:
            print(f"Usuario '{d['username']}' ya existía")
            continue
        session.add(
            Usuario(
                username=d["username"],
                full_name=d["full_name"],
                email=d["email"],
                hashed_password=hash_password(d["password"]),
                role=d["role"],
            )
        )
        print(f"Usuario '{d['username']}' creado")
    session.flush()


def seed_categorias(session: Session) -> None:
    for d in CATEGORIAS:
        existe = session.exec(select(Categoria).where(Categoria.nombre == d["nombre"])).first()
        if existe:
            print(f"Categoría '{d['nombre']}' ya existía")
            continue
        session.add(Categoria(nombre=d["nombre"], descripcion=d["descripcion"]))
        print(f"Categoría '{d['nombre']}' creada")
    session.flush()  # para tener los ids antes de crear productos


def seed_productos(session: Session) -> None:
    for d in PRODUCTOS:
        nombre = str(d["nombre"])
        existe = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
        if existe:
            print(f"Producto '{nombre}' ya existía")
            continue
        categoria = session.exec(select(Categoria).where(Categoria.nombre == d["categoria"])).one()
        session.add(
            Producto(
                categoria_id=categoria.id,
                nombre=nombre,
                descripcion=str(d["descripcion"]),
                precio_base=float(d["precio_base"]),
                imagen_url=f"https://placehold.co/400x300?text={quote_plus(nombre)}",
                stock=int(d["stock"]),
                disponible=True,
            )
        )
        print(f"Producto '{nombre}' creado")
    session.flush()


def main() -> None:
    create_all_tables()
    with UnitOfWork() as uow:
        seed_usuarios(uow.session)
        seed_categorias(uow.session)
        seed_productos(uow.session)
    print("Seed finalizado")


if __name__ == "__main__":
    main()
