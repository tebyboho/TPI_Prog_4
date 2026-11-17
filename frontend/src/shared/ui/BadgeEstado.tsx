import type { EstadoPedido } from "../../features/pedidos/types";

const estilos: Record<EstadoPedido, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  EN_PREPARACION: "bg-blue-100 text-blue-800",
  ENTREGADO: "bg-green-100 text-green-800",
  CANCELADO: "bg-red-100 text-red-800",
};

const etiquetas: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "En preparación",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${estilos[estado]}`}>
      {etiquetas[estado]}
    </span>
  );
}
