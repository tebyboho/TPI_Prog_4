import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cambiarEstadoPedido,
  cancelarPedido,
  crearPedido,
  getPedido,
  getPedidos,
  getResumenPedidos,
} from "../api/pedidos";
import type { EstadoPedido, PedidosFiltros } from "../types";

export function useResumenPedidos() {
  return useQuery({ queryKey: ["pedidos", "resumen"], queryFn: getResumenPedidos });
}

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}

export function usePedidos(filtros: PedidosFiltros) {
  return useQuery({
    queryKey: ["pedidos", "lista", filtros],
    queryFn: () => getPedidos(filtros),
  });
}

export function usePedido(id: number | null) {
  return useQuery({
    queryKey: ["pedidos", "detalle", id],
    queryFn: () => getPedido(id ?? 0),
    enabled: id !== null,
  });
}

export function useCrearPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearPedido,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}

export function useCancelarPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelarPedido,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}
