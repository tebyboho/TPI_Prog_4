import { useQueryClient } from "@tanstack/react-query";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";

const linkClase = ({ isActive }: { isActive: boolean }) =>
  `rounded px-2 py-1 text-sm ${isActive ? "bg-orange-100 font-semibold text-orange-700" : "text-gray-700 hover:text-orange-600"}`;

const linksAdmin = [
  { to: "/admin/resumen", texto: "Resumen" },
  { to: "/admin/categorias", texto: "Categorías" },
  { to: "/admin/productos", texto: "Productos" },
  { to: "/admin/pedidos", texto: "Pedidos" },
  { to: "/admin/usuarios", texto: "Usuarios" },
];

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const cantidadCarrito = useCartStore((s) => s.items.reduce((acc, i) => acc + i.cantidad, 0));
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await logout();
    queryClient.clear();
    navigate("/login");
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="container mx-auto flex flex-wrap items-center gap-2 p-4">
        <NavLink to="/" className="mr-4 text-lg font-bold text-orange-600">
          Food Store
        </NavLink>
        <NavLink to="/" end className={linkClase}>
          Catálogo
        </NavLink>
        <NavLink to="/carrito" className={linkClase}>
          Carrito ({cantidadCarrito})
        </NavLink>
        {usuario && (
          <NavLink to="/mis-pedidos" className={linkClase}>
            Mis pedidos
          </NavLink>
        )}
        {usuario?.role === "admin" &&
          linksAdmin.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClase}>
              {l.texto}
            </NavLink>
          ))}

        <div className="ml-auto flex items-center gap-3">
          {usuario ? (
            <>
              <span className="text-sm text-gray-600">
                {usuario.full_name} <span className="text-xs text-gray-400">({usuario.role})</span>
              </span>
              <button
                type="button"
                onClick={() => void cerrarSesion()}
                className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClase}>
                Ingresar
              </NavLink>
              <NavLink to="/register" className={linkClase}>
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
