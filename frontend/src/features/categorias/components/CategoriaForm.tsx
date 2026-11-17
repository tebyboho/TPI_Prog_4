import { useForm } from "@tanstack/react-form";
import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { useActualizarCategoria, useCrearCategoria } from "../hooks/useCategorias";
import type { Categoria } from "../types";

interface CategoriaFormProps {
  inicial?: Categoria;
  onExito: () => void;
}

export function CategoriaForm({ inicial, onExito }: CategoriaFormProps) {
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();
  const mutacion = inicial ? actualizar : crear;

  const form = useForm({
    defaultValues: { nombre: inicial?.nombre ?? "", descripcion: inicial?.descripcion ?? "" },
    onSubmit: async ({ value }) => {
      const data = { nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null };
      try {
        if (inicial) await actualizar.mutateAsync({ id: inicial.id, data });
        else await crear.mutateAsync(data);
        onExito();
      } catch {
        // El error (ej. 409 nombre duplicado) se muestra abajo.
      }
    },
  });

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field
        name="nombre"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length;
            return largo < 2 || largo > 100 ? "El nombre debe tener entre 2 y 100 caracteres" : undefined;
          },
        }}
      >
        {(field) => (
          <Input
            label="Nombre"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors.join(", ") || undefined}
          />
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(field) => (
          <Input
            label="Descripción (opcional)"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>

      {mutacion.isError && <EstadoError mensaje={handleApiError(mutacion.error)} />}

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : inicial ? "Guardar cambios" : "Crear categoría"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
