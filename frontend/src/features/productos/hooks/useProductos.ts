import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { actualizarProducto, actualizarStock, crearProducto, eliminarProducto, getProductos } from "../api/productos";
import type { ProductosFiltros, ProductoStockUpdate, ProductoUpdate } from "../types";

export function useProductos(filtros: ProductosFiltros) {
  return useQuery({
    queryKey: ["productos", filtros],
    queryFn: () => getProductos(filtros),
    placeholderData: keepPreviousData,
  });
}

function useInvalidarProductos() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["productos"] });
}

export function useCrearProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({ mutationFn: crearProducto, onSuccess: invalidar });
}

export function useActualizarProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoUpdate }) => actualizarProducto(id, data),
    onSuccess: invalidar,
  });
}

export function useActualizarStock() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoStockUpdate }) => actualizarStock(id, data),
    onSuccess: invalidar,
  });
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({ mutationFn: eliminarProducto, onSuccess: invalidar });
}
