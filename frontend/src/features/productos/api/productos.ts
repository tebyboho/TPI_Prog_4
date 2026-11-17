import { api } from "../../../shared/api/axiosInstance";
import type {
  Producto,
  ProductoCreate,
  ProductosFiltros,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from "../types";

export async function getProductos(filtros: ProductosFiltros): Promise<ProductosPaginados> {
  // Solo se envían los filtros con valor.
  const params: Record<string, string | number | boolean> = { skip: filtros.skip, limit: filtros.limit };
  if (filtros.search) params.search = filtros.search;
  if (filtros.categoria_id !== undefined) params.categoria_id = filtros.categoria_id;
  if (filtros.disponible !== undefined) params.disponible = filtros.disponible;

  const res = await api.get<ProductosPaginados>("/productos", { params });
  return res.data;
}

export async function getProducto(id: number): Promise<Producto> {
  const res = await api.get<Producto>(`/productos/${id}`);
  return res.data;
}

export async function crearProducto(data: ProductoCreate): Promise<Producto> {
  const res = await api.post<Producto>("/productos", data);
  return res.data;
}

export async function actualizarProducto(id: number, data: ProductoUpdate): Promise<Producto> {
  const res = await api.put<Producto>(`/productos/${id}`, data);
  return res.data;
}

export async function actualizarStock(id: number, data: ProductoStockUpdate): Promise<Producto> {
  const res = await api.patch<Producto>(`/productos/${id}/stock`, data);
  return res.data;
}

export async function eliminarProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`);
}
