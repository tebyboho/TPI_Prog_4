import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";
import { useAuthStore } from "../../../store/authStore";

interface LoginState {
  from?: string;
  mensaje?: string;
}

function leerState(state: unknown): LoginState {
  if (typeof state !== "object" || state === null) return {};
  const r: LoginState = {};
  if ("from" in state && typeof state.from === "string") r.from = state.from;
  if ("mensaje" in state && typeof state.mensaje === "string") r.mensaje = state.mensaje;
  return r;
}

const requerido = ({ value }: { value: string }) => (value.trim() ? undefined : "Campo requerido");

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const { from, mensaje } = leerState(useLocation().state);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { username: "", password: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await login(value.username, value.password);
        navigate(from ?? "/", { replace: true });
      } catch (e) {
        setError(handleApiError(e));
      }
    },
  });

  return (
    <div className="mx-auto mt-8 max-w-sm">
      <Card>
        <h1 className="mb-4 text-xl font-bold">Ingresar</h1>
        {mensaje && <p className="mb-3 rounded bg-green-50 p-2 text-sm text-green-700">{mensaje}</p>}
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field name="username" validators={{ onChange: requerido }}>
            {(field) => (
              <Input
                label="Usuario"
                autoComplete="username"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join(", ") || undefined}
              />
            )}
          </form.Field>
          <form.Field name="password" validators={{ onChange: requerido }}>
            {(field) => (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join(", ") || undefined}
              />
            )}
          </form.Field>
          {error && <EstadoError mensaje={error} />}
          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Ingresando..." : "Ingresar"}
              </Button>
            )}
          </form.Subscribe>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="text-orange-600 hover:underline">
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  );
}
