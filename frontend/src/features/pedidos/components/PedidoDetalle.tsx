import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { Skeleton } from "../../../shared/components/Skeleton";
import { BadgeEstado } from "../../../shared/ui/BadgeEstado";
import { ETIQUETA_FORMA_PAGO, formatearFecha, formatearPrecio } from "../../../shared/utils/formato";
import { usePedido } from "../hooks/usePedidos";

export function PedidoDetalle({ id }: { id: number }) {
  const { data: pedido, isLoading, isError, error } = usePedido(id);

  if (isLoading) return <Skeleton className="h-48" />;
  if (isError) return <EstadoError mensaje={handleApiError(error)} />;
  if (!pedido) return null;

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <span className="text-gray-500">Estado</span>
        <span>
          <BadgeEstado estado={pedido.estado} />
        </span>
        <span className="text-gray-500">Fecha</span>
        <span>{formatearFecha(pedido.created_at)}</span>
        <span className="text-gray-500">Forma de pago</span>
        <span>{ETIQUETA_FORMA_PAGO[pedido.forma_pago]}</span>
        <span className="text-gray-500">Dirección</span>
        <span>{pedido.direccion_entrega}</span>
        <span className="text-gray-500">Notas</span>
        <span>{pedido.notas ?? "—"}</span>
      </div>

      <table className="w-full text-left">
        <thead className="border-b text-gray-600">
          <tr>
            <th className="py-1">Producto</th>
            <th className="py-1 text-right">Precio</th>
            <th className="py-1 text-right">Cant.</th>
            <th className="py-1 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {pedido.items.map((l) => (
            <tr key={l.producto_id} className="border-b border-gray-100">
              <td className="py-1">{l.nombre_producto}</td>
              <td className="py-1 text-right">{formatearPrecio(l.precio_unitario)}</td>
              <td className="py-1 text-right">{l.cantidad}</td>
              <td className="py-1 text-right">{formatearPrecio(l.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-right text-base font-semibold">Total: {formatearPrecio(pedido.total)}</p>
    </div>
  );
}
