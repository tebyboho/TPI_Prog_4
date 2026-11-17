import { Link, useNavigate } from "react-router-dom";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { formatearPrecio } from "../../../shared/utils/formato";
import { useCartStore } from "../../../store/cartStore";

export default function CarritoPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const quitar = useCartStore((s) => s.quitar);
  const vaciar = useCartStore((s) => s.vaciar);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <EstadoVacio mensaje="Tu carrito está vacío">
        <Link to="/" className="text-orange-600 hover:underline">
          Ir al catálogo
        </Link>
      </EstadoVacio>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Carrito</h1>
      <Card className="flex flex-col divide-y divide-gray-100">
        {items.map((i) => (
          <div key={i.producto_id} className="flex flex-wrap items-center gap-4 py-3">
            <div className="flex-1">
              <p className="font-medium">{i.nombre}</p>
              <p className="text-sm text-gray-500">{formatearPrecio(i.precio_unitario)} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                aria-label="Restar uno"
                disabled={i.cantidad <= 1}
                onClick={() => cambiarCantidad(i.producto_id, i.cantidad - 1)}
              >
                −
              </Button>
              <span className="w-8 text-center">{i.cantidad}</span>
              <Button
                variant="secondary"
                aria-label="Sumar uno"
                onClick={() => cambiarCantidad(i.producto_id, i.cantidad + 1)}
              >
                +
              </Button>
            </div>
            <span className="w-28 text-right font-semibold">{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
            <Button variant="danger" onClick={() => quitar(i.producto_id)}>
              Quitar
            </Button>
          </div>
        ))}
      </Card>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" onClick={vaciar}>
          Vaciar carrito
        </Button>
        <div className="flex items-center gap-4">
          <span className="text-lg">
            Total: <strong>{formatearPrecio(total())}</strong>
          </span>
          <Button onClick={() => navigate("/checkout")}>Confirmar pedido</Button>
        </div>
      </div>
    </div>
  );
}
