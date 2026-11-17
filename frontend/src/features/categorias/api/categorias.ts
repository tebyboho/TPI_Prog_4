import { api } from "../../../shared/api/axiosInstance";
import type { Categoria, CategoriaCreate, CategoriaUpdate } from "../types";

export async function getCategorias(): Promise<Categoria[]> {
  const res = await api.get<Categoria[]>("/categorias");
  return res.data;
}

export async function getCategoria(id: number): Promise<Categoria> {
  const res = await api.get<Categoria>(`/categorias/${id}`);
  return res.data;
}

export async function crearCategoria(data: CategoriaCreate): Promise<Categoria> {
  const res = await api.post<Categoria>("/categorias", data);
  return res.data;
}

export async function actualizarCategoria(id: number, data: CategoriaUpdate): Promise<Categoria> {
  const res = await api.put<Categoria>(`/categorias/${id}`, data);
  return res.data;
}

export async function eliminarCategoria(id: number): Promise<void> {
  await api.delete(`/categorias/${id}`);
}
