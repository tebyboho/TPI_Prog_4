import { Link } from "react-router-dom";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Card } from "../../../shared/ui/Card";
import { formatearPrecio } from "../../../shared/utils/formato";
import { useCartStore } from "../../../store/cartStore";
import { CheckoutForm } from "../components/CheckoutForm";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);

  if (items.length === 0) {
    return (
      <EstadoVacio mensaje="No hay productos en el carrito">
        <Link to="/" className="text-orange-600 hover:underline">
          Ir al catálogo
        </Link>
      </EstadoVacio>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Checkout</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">Resumen</h2>
          <ul className="divide-y divide-gray-100 text-sm">
            {items.map((i) => (
              <li key={i.producto_id} className="flex justify-between py-2">
                <span>
                  {i.cantidad} × {i.nombre}
                </span>
                <span>{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between border-t pt-3 font-semibold">
            <span>Total estimado</span>
            <span>{formatearPrecio(total())}</span>
          </p>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Datos de entrega</h2>
          <CheckoutForm />
        </Card>
      </div>
    </div>
  );
}
