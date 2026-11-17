import { useForm } from "@tanstack/react-form";
import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { useActualizarStock } from "../hooks/useProductos";
import type { Producto } from "../types";

interface StockFormProps {
  producto: Producto;
  onExito: () => void;
}

export function StockForm({ producto, onExito }: StockFormProps) {
  const actualizarStock = useActualizarStock();

  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      try {
        await actualizarStock.mutateAsync({ id: producto.id, data: value });
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
      <p className="text-sm text-gray-600">{producto.nombre}</p>
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

      {actualizarStock.isError && <EstadoError mensaje={handleApiError(actualizarStock.error)} />}

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Actualizar stock"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
