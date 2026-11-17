import { api } from "../../../shared/api/axiosInstance";
import type { EstadoPedido, Pedido, PedidoCreate, PedidosFiltros, PedidosPaginados, ResumenPedidos } from "../types";

export async function getPedidos(filtros: PedidosFiltros): Promise<PedidosPaginados> {
  const params: Record<string, string | number> = { skip: filtros.skip, limit: filtros.limit };
  if (filtros.estado) params.estado = filtros.estado;

  const res = await api.get<PedidosPaginados>("/pedidos", { params });
  return res.data;
}

export async function getPedido(id: number): Promise<Pedido> {
  const res = await api.get<Pedido>(`/pedidos/${id}`);
  return res.data;
}

export async function crearPedido(data: PedidoCreate): Promise<Pedido> {
  const res = await api.post<Pedido>("/pedidos", data);
  return res.data;
}

export async function cambiarEstadoPedido(id: number, estado: EstadoPedido): Promise<Pedido> {
  const res = await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado });
  return res.data;
}

export async function cancelarPedido(id: number): Promise<Pedido> {
  const res = await api.patch<Pedido>(`/pedidos/${id}/cancelar`);
  return res.data;
}

export async function getResumenPedidos(): Promise<ResumenPedidos> {
  const res = await api.get<ResumenPedidos>("/pedidos/resumen");
  return res.data;
}
