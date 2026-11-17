import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";
import { register } from "../api/auth";
import type { UserCreate } from "../types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: register,
    onSuccess: () => navigate("/login", { state: { mensaje: "Registro exitoso, ingresá" } }),
  });

  const form = useForm({
    defaultValues: { username: "", full_name: "", email: "", password: "" } satisfies UserCreate,
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync(value);
      } catch {
        // El error se muestra desde mutation.error
      }
    },
  });

  return (
    <div className="mx-auto mt-8 max-w-sm">
      <Card>
        <h1 className="mb-4 text-xl font-bold">Crear cuenta</h1>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field
            name="username"
            validators={{ onChange: ({ value }) => (value.trim().length >= 3 ? undefined : "Mínimo 3 caracteres") }}
          >
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
          <form.Field
            name="full_name"
            validators={{ onChange: ({ value }) => (value.trim() ? undefined : "Campo requerido") }}
          >
            {(field) => (
              <Input
                label="Nombre completo"
                autoComplete="name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join(", ") || undefined}
              />
            )}
          </form.Field>
          <form.Field
            name="email"
            validators={{ onChange: ({ value }) => (EMAIL_RE.test(value) ? undefined : "Email inválido") }}
          >
            {(field) => (
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join(", ") || undefined}
              />
            )}
          </form.Field>
          <form.Field
            name="password"
            validators={{ onChange: ({ value }) => (value.length >= 8 ? undefined : "Mínimo 8 caracteres") }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join(", ") || undefined}
              />
            )}
          </form.Field>
          {mutation.isError && <EstadoError mensaje={handleApiError(mutation.error)} />}
          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registrando..." : "Registrarme"}
              </Button>
            )}
          </form.Subscribe>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="text-orange-600 hover:underline">
            Ingresá
          </Link>
        </p>
      </Card>
    </div>
  );
}
