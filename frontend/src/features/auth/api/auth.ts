import { api } from "../../../shared/api/axiosInstance";
import type { UserPublic } from "../../usuarios/types";
import type { LoginRequest, MensajeResponse, UserCreate } from "../types";

export async function login(data: LoginRequest): Promise<MensajeResponse> {
  // OAuth2PasswordRequestForm espera application/x-www-form-urlencoded
  const body = new URLSearchParams({ username: data.username, password: data.password });
  const res = await api.post<MensajeResponse>("/auth/token", body);
  return res.data;
}

export async function logout(): Promise<MensajeResponse> {
  const res = await api.post<MensajeResponse>("/auth/logout");
  return res.data;
}

export async function me(): Promise<UserPublic> {
  const res = await api.get<UserPublic>("/auth/me");
  return res.data;
}

export async function register(data: UserCreate): Promise<UserPublic> {
  const res = await api.post<UserPublic>("/auth/register", data);
  return res.data;
}
