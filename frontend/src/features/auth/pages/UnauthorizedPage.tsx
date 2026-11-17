import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="mt-12 text-center">
      <h1 className="mb-2 text-2xl font-bold">Acceso denegado</h1>
      <p className="mb-4 text-gray-600">No tenés permiso para ver esta página</p>
      <Link to="/" className="text-orange-600 hover:underline">
        Volver al catálogo
      </Link>
    </div>
  );
}
