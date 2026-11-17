from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import get_current_active_user
from app.modules.auth.schemas import MensajeResponse
from app.modules.auth.service import AuthService, CredencialesInvalidas, CuentaDesactivada, UsuarioDuplicado
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


@router.post("/register", response_model=UserPublic, status_code=201)
def register(data: UserCreate, service: AuthService = Depends(get_auth_service)) -> UserPublic:
    try:
        return service.registrar(data)
    except UsuarioDuplicado:
        raise HTTPException(status_code=409, detail="El username o email ya existe")


@router.post("/token", response_model=MensajeResponse)
def login(
    response: Response,
    form: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
) -> MensajeResponse:
    try:
        token = service.login(form.username, form.password)
    except CredencialesInvalidas:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    except CuentaDesactivada:
        raise HTTPException(status_code=400, detail="Cuenta de usuario desactivada")
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,
        path="/",
    )
    return MensajeResponse(message="Login exitoso")


@router.post("/logout", response_model=MensajeResponse)
def logout(response: Response) -> MensajeResponse:
    response.delete_cookie("access_token", path="/")
    return MensajeResponse(message="Logout exitoso")


@router.get("/me", response_model=UserPublic)
def me(user: UserPublic = Depends(get_current_active_user)) -> UserPublic:
    return user
