import { useEffect } from "react";
import AppRouter from "./routes/AppRouter";
import { useAuthStore } from "./store/authStore";

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession);

  // Único useEffect de datos: validar la sesión (cookie) contra /auth/me al iniciar.
  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  return <AppRouter />;
}
