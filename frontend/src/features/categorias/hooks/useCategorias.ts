import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { actualizarCategoria, crearCategoria, eliminarCategoria, getCategorias } from "../api/categorias";
import type { CategoriaUpdate } from "../types";

export function useCategorias() {
  return useQuery({ queryKey: ["categorias"], queryFn: getCategorias });
}

export function useCrearCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearCategoria,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categorias"] });
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaUpdate }) => actualizarCategoria(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categorias"] });
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eliminarCategoria,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categorias"] });
    },
  });
}
