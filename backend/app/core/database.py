from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {},
)


def session_factory() -> Session:
    return Session(engine, expire_on_commit=False)


def create_all_tables() -> None:
    # Importar los modelos registra las tablas en SQLModel.metadata.
    from app.modules.usuarios import models as usuarios_models  # noqa: F401
    from app.modules.categorias import models as categorias_models  # noqa: F401
    from app.modules.productos import models as productos_models  # noqa: F401
    from app.modules.pedidos import models as pedidos_models  # noqa: F401

    SQLModel.metadata.create_all(engine)
