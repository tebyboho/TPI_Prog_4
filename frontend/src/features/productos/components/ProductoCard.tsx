import { useState } from "react";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { formatearPrecio } from "../../../shared/utils/formato";
import { useCartStore } from "../../../store/cartStore";
import type { Producto } from "../types";

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar);
  const enCarrito = useCartStore(
    (s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0,
  );
  const [agregado, setAgregado] = useState(false);

  const sinStock = !producto.disponible || producto.stock === 0;
  const alcanzoStock = enCarrito >= producto.stock;

  const onAgregar = () => {
    agregar({ producto_id: producto.id, nombre: producto.nombre, precio_unitario: producto.precio_base });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1200);
  };

  return (
    <Card className="flex flex-col gap-2">
      {producto.imagen_url ? (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          className="h-40 w-full rounded object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-40 w-full items-center justify-center rounded bg-gray-100 text-sm text-gray-400">
          Sin imagen
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-semibold">{producto.nombre}</h3>
        <p className="text-xs text-gray-500">{producto.categoria.nombre}</p>
        {producto.descripcion && <p className="mt-1 text-sm text-gray-600">{producto.descripcion}</p>}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-orange-600">{formatearPrecio(producto.precio_base)}</span>
        <span className={`text-xs ${sinStock ? "text-red-600" : "text-gray-500"}`}>
          {sinStock ? "Sin stock" : `Stock: ${producto.stock}`}
        </span>
      </div>
      <Button onClick={onAgregar} disabled={sinStock || alcanzoStock || agregado}>
        {agregado ? "Agregado ✓" : alcanzoStock && !sinStock ? "Máximo en carrito" : "Agregar al carrito"}
      </Button>
    </Card>
  );
}
