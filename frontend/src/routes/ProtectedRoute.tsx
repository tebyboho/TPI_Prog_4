import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Role } from "../features/usuarios/types";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
  roles?: Role[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  const location = useLocation();

  if (cargando) {
    return <p className="p-8 text-center text-gray-500">Verificando sesión...</p>;
  }
  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}
