# Food Store

Aplicación web de pedidos de comida: los clientes recorren el catálogo, arman un carrito y confirman pedidos; el administrador gestiona categorías, productos, stock, pedidos y usuarios.
Backend en FastAPI + SQLModel + PostgreSQL y frontend en React + TypeScript + Vite (TPI de Programación 4).

- **Repositorio:** `http://github.com/tebyboho/TPI_Prog_4`
- **Video demo:** `https://drive.google.com/file/d/1UUVng_G21GWQmVWkCuEoJnsGtArX4zCR/view?usp=sharing`

---

## 1. Requisitos

| Herramienta | Versión |
|---|---|
| Python | 3.11, 3.12 o 3.13 (**no** 3.14) |
| PostgreSQL | 15 o superior |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior (`npm i -g pnpm` o `corepack enable`) |

---

## 2. Base de datos

Crear la base `foodstore_db` con un usuario que sea su dueño (ejemplo con el superusuario `postgres`):

**Linux / macOS**
```bash
psql -U postgres -c "CREATE USER tp5_user WITH PASSWORD 'tp5_pass';"
psql -U postgres -c "CREATE DATABASE foodstore_db OWNER tp5_user;"
```

**Windows (PowerShell)**
```powershell
psql -U postgres -c "CREATE USER tp5_user WITH PASSWORD 'tp5_pass';"
psql -U postgres -c "CREATE DATABASE foodstore_db OWNER tp5_user;"
```

Las tablas se crean solas al iniciar el backend o al correr el seed.

> Para desarrollo también se acepta SQLite: en `backend/.env` usar `DATABASE_URL=sqlite:///./foodstore.db` (no hace falta crear nada).

---

## 3. Backend

**Linux / macOS**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # completar DATABASE_URL y SECRET_KEY
python -m app.db.seed
uvicorn app.main:app --reload
```

**Windows (PowerShell)**
```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env   # completar DATABASE_URL y SECRET_KEY
python -m app.db.seed
uvicorn app.main:app --reload
```

> En Windows, si PowerShell bloquea `Activate.ps1`, ejecutar antes `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`.

Para generar una `SECRET_KEY`:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

- API: `http://localhost:8000/api/v1`
- Documentación: `http://localhost:8000/docs` (Swagger) y `http://localhost:8000/redoc`

El seed es idempotente: se puede correr varias veces sin duplicar datos.

---

## 4. Frontend

En otra terminal, con el backend corriendo:

**Linux / macOS**
```bash
cd frontend
pnpm install
cp .env.example .env
pnpm dev
```

**Windows (PowerShell)**
```powershell
cd frontend
pnpm install
Copy-Item .env.example .env
pnpm dev
```

Abrir **`http://localhost:5173`**. Usar siempre `localhost` (no `127.0.0.1`): la cookie de sesión funciona porque frontend y backend comparten el mismo *site*.

`pnpm build` compila con TypeScript estricto y verifica los tipos.

---

## 5. Variables de entorno

**Backend (`backend/.env`)**

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql+psycopg2://tp5_user:tp5_pass@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Clave para firmar el JWT (mínimo 32 caracteres) | salida de `secrets.token_hex(32)` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión en minutos | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |

**Frontend (`frontend/.env`)**

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

---

## 6. Usuarios del seed

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | admin |
| `cliente` | `Cliente1234!` | user |

El seed también carga 4 categorías (Pizzas, Hamburguesas, Bebidas, Postres) y 8 productos con stock.

---

## 7. Arquitectura

**Backend** — módulos por dominio (`auth`, `usuarios`, `categorias`, `productos`, `pedidos`) con capas:

```
Router  →  Service  →  UnitOfWork  →  Repository  →  Model
```

- **Router:** define el endpoint, obtiene el Service por `Depends` y traduce las excepciones de dominio a códigos HTTP.
- **Service:** reglas de negocio; abre `with self.uow as uow:` y devuelve schemas (nunca modelos de tabla).
- **UnitOfWork:** una transacción por operación; el único `commit()` del proyecto está en su `__exit__` (rollback si hubo error).
- **Repository:** solo consultas (`BaseRepository[T]` genérico).
- Baja lógica en categorías, productos y usuarios; los pedidos nunca se borran. Los pedidos siguen una máquina de estados (`PENDIENTE → EN_PREPARACION → ENTREGADO`, con cancelación y restitución de stock).

**Frontend** — organizado por features (`auth`, `productos`, `categorias`, `pedidos`, `usuarios`) más una capa `shared/`:

- Estado del servidor con **TanStack Query** (consultas + mutaciones con invalidación).
- Estado del cliente con **Zustand** + `persist` (`authStore` con los datos públicos del usuario y `cartStore` con el carrito).
- Formularios con **TanStack Form** y tablas del panel con **TanStack Table**.
- Sesión: el JWT viaja **solo** en una cookie `HttpOnly` (`access_token`); Axios usa `withCredentials` y un interceptor limpia la sesión ante 401. `ProtectedRoute` protege rutas por sesión y por rol.

---

## 8. Estructura de carpetas

```
TPI/
├── README.md
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py                 # FastAPI, CORS, routers bajo /api/v1
│       ├── core/                   # config, database, security, deps, unit_of_work, base_repository
│       ├── db/seed.py              # datos iniciales (idempotente)
│       └── modules/
│           ├── auth/               # schemas, service, router
│           ├── usuarios/           # models, schemas, repository, unit_of_work, service, router
│           ├── categorias/         # ídem
│           ├── productos/          # ídem
│           └── pedidos/            # ídem
└── frontend/
    ├── package.json
    ├── .env.example
    └── src/
        ├── main.tsx, App.tsx
        ├── routes/                 # AppRouter, ProtectedRoute
        ├── store/                  # authStore, cartStore
        ├── shared/                 # api (axios, errores, queryClient), ui, components, layout, utils
        └── features/
            ├── auth/               # api, types, pages (login, registro, unauthorized)
            ├── productos/          # api, hooks, types, components, pages (catálogo, admin)
            ├── categorias/         # api, hooks, types, components, pages (admin)
            ├── pedidos/            # api, hooks, types, components, pages (carrito, checkout, mis pedidos, admin, resumen)
            └── usuarios/           # api, hooks, types, pages (admin)
```
