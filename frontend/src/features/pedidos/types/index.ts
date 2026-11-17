export type EstadoPedido = "PENDIENTE" | "EN_PREPARACION" | "ENTREGADO" | "CANCELADO";

export type FormaPago = "EFECTIVO" | "TRANSFERENCIA";

export const ESTADOS_PEDIDO: EstadoPedido[] = ["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"];

// Acciones del admin según la máquina de estados del backend.
export const ACCIONES: Record<EstadoPedido, { label: string; estado: EstadoPedido }[]> = {
  PENDIENTE: [
    { label: "Pasar a preparación", estado: "EN_PREPARACION" },
    { label: "Cancelar", estado: "CANCELADO" },
  ],
  EN_PREPARACION: [
    { label: "Marcar entregado", estado: "ENTREGADO" },
    { label: "Cancelar", estado: "CANCELADO" },
  ],
  ENTREGADO: [],
  CANCELADO: [],
};

export interface DetallePedido {
  producto_id: number;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  usuario_id: number;
  estado: EstadoPedido;
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
  total: number;
  created_at: string;
  updated_at: string;
  items: DetallePedido[];
}

export interface PedidosPaginados {
  total: number;
  items: Pedido[];
}

export interface ItemPedidoCreate {
  producto_id: number;
  cantidad: number;
}

export interface PedidoCreate {
  items: ItemPedidoCreate[];
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
}

export interface ResumenPedidos {
  pendientes: number;
  en_preparacion: number;
  entregados: number;
  cancelados: number;
  pedidos_hoy: number;
  ingresos_entregados: number;
}

export interface PedidosFiltros {
  skip: number;
  limit: number;
  estado?: EstadoPedido;
}
