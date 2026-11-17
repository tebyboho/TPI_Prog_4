import type { FormaPago } from "../../features/pedidos/types";

export function formatearPrecio(valor: number): string {
  return valor.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
}

export function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleString("es-AR");
}

export const ETIQUETA_FORMA_PAGO: Record<FormaPago, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
};
