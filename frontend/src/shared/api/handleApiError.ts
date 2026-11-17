import axios from "axios";

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return "No se pudo conectar con el servidor";

    const data: unknown = error.response.data;
    if (typeof data === "object" && data !== null && "detail" in data) {
      const detail: unknown = data.detail;
      if (typeof detail === "string") return detail;
      if (Array.isArray(detail)) {
        const mensajes = detail
          .map((d: unknown) =>
            typeof d === "object" && d !== null && "msg" in d && typeof d.msg === "string" ? d.msg : null,
          )
          .filter((m): m is string => m !== null);
        if (mensajes.length > 0) return mensajes.join(". ");
      }
    }
  }
  return "Ocurrió un error inesperado";
}
