import { api } from "../../../shared/api/axiosInstance";
import type { UserPublic } from "../types";

export async function getUsuarios(): Promise<UserPublic[]> {
  const res = await api.get<UserPublic[]>("/admin/usuarios");
  return res.data;
}

export async function activarUsuario(id: number): Promise<UserPublic> {
  const res = await api.post<UserPublic>(`/admin/usuarios/${id}/activar`);
  return res.data;
}

export async function desactivarUsuario(id: number): Promise<UserPublic> {
  const res = await api.post<UserPublic>(`/admin/usuarios/${id}/desactivar`);
  return res.data;
}
