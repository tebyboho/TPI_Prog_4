import { useForm } from "@tanstack/react-form";
import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import { useActualizarProducto, useCrearProducto } from "../hooks/useProductos";
import type { Producto, ProductoCreate } from "../types";

interface ProductoFormProps {
  inicial?: Producto;
  onExito: () => void;
}

interface ProductoValues {
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string;
  stock: number;
  disponible: boolean;
  categoria_id: number; // 0 = sin seleccionar
}

export function ProductoForm({ inicial, onExito }: ProductoFormProps) {
  const categorias = useCategorias();
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();
  const mutacion = inicial ? actualizar : crear;

  const defaultValues: ProductoValues = {
    nombre: inicial?.nombre ?? "",
    descripcion: inicial?.descripcion ?? "",
    precio_base: inicial?.precio_base ?? 0,
    imagen_url: inicial?.imagen_url ?? "",
    stock: inicial?.stock ?? 0,
    disponible: inicial?.disponible ?? true,
    categoria_id: inicial?.categoria_id ?? 0,
  };

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const data: ProductoCreate = {
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: value.precio_base,
        imagen_url: value.imagen_url.trim() || null,
        stock: value.stock,
        disponible: value.disponible,
        categoria_id: value.categoria_id,
      };
      try {
        if (inicial) await actualizar.mutateAsync({ id: inicial.id, data });
        else await crear.mutateAsync(data);
        onExito();
      } catch {
        // El error se muestra abajo.
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
        validators={{ onChange: ({ value }) => (value.trim() ? undefined : "Campo requerido") }}
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

      <div className="grid grid-cols-2 gap-3">
        <form.Field
          name="precio_base"
          validators={{
            onChange: ({ value }) => (Number.isFinite(value) && value >= 0 ? undefined : "Debe ser un número ≥ 0"),
          }}
        >
          {(field) => (
            <Input
              label="Precio"
              type="number"
              min={0}
              step="0.01"
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              onBlur={field.handleBlur}
              error={field.state.meta.errors.join(", ") || undefined}
            />
          )}
        </form.Field>
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) => (Number.isInteger(value) && value >= 0 ? undefined : "Debe ser un entero ≥ 0"),
          }}
        >
          {(field) => (
            <Input
              label="Stock"
              type="number"
              min={0}
              step={1}
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              onBlur={field.handleBlur}
              error={field.state.meta.errors.join(", ") || undefined}
            />
          )}
        </form.Field>
      </div>

      <form.Field name="imagen_url">
        {(field) => (
          <Input
            label="URL de imagen (opcional)"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>

      <form.Field
        name="categoria_id"
        validators={{ onChange: ({ value }) => (value > 0 ? undefined : "Elegí una categoría") }}
      >
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="categoria_id" className="text-sm font-medium text-gray-700">
              Categoría
            </label>
            <select
              id="categoria_id"
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              onBlur={field.handleBlur}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value={0}>Seleccionar...</option>
              {categorias.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            {field.state.meta.errors.length > 0 && (
              <span className="text-xs text-red-600">{field.state.meta.errors.join(", ")}</span>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
            />
            Disponible
          </label>
        )}
      </form.Field>

      {mutacion.isError && <EstadoError mensaje={handleApiError(mutacion.error)} />}

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : inicial ? "Guardar cambios" : "Crear producto"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
