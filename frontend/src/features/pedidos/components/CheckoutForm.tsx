import { useForm } from "@tanstack/react-form";
import { useNavigate } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { useCartStore } from "../../../store/cartStore";
import { useCrearPedido } from "../hooks/usePedidos";
import type { FormaPago } from "../types";

interface CheckoutValues {
  direccion_entrega: string;
  forma_pago: FormaPago;
  notas: string;
}

const esFormaPago = (v: string): v is FormaPago => v === "EFECTIVO" || v === "TRANSFERENCIA";

export function CheckoutForm() {
  const items = useCartStore((s) => s.items);
  const vaciar = useCartStore((s) => s.vaciar);
  const crearPedido = useCrearPedido();
  const navigate = useNavigate();

  const defaultValues: CheckoutValues = { direccion_entrega: "", forma_pago: "EFECTIVO", notas: "" };

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      try {
        await crearPedido.mutateAsync({
          items: items.map(({ producto_id, cantidad }) => ({ producto_id, cantidad })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim() || null,
        });
        vaciar();
        navigate("/mis-pedidos");
      } catch {
        // El error se muestra desde crearPedido.error; el carrito no se vacía.
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
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length;
            if (largo < 5) return "La dirección debe tener al menos 5 caracteres";
            if (largo > 200) return "La dirección no puede superar 200 caracteres";
            return undefined;
          },
        }}
      >
        {(field) => (
          <Input
            label="Dirección de entrega"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors.join(", ") || undefined}
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="forma_pago" className="text-sm font-medium text-gray-700">
              Forma de pago
            </label>
            <select
              id="forma_pago"
              value={field.state.value}
              onChange={(e) => {
                if (esFormaPago(e.target.value)) field.handleChange(e.target.value);
              }}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>
        )}
      </form.Field>

      <form.Field name="notas">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="notas" className="text-sm font-medium text-gray-700">
              Notas (opcional)
            </label>
            <textarea
              id="notas"
              rows={3}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        )}
      </form.Field>

      {crearPedido.isError && <EstadoError mensaje={handleApiError(crearPedido.error)} />}

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando pedido..." : "Confirmar pedido"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
