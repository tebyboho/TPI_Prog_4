import { useState } from "react";
import { Link } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Paginacion } from "../../../shared/components/Paginacion";
import { Skeleton } from "../../../shared/components/Skeleton";
import { BadgeEstado } from "../../../shared/ui/BadgeEstado";
import { Button } from "../../../shared/ui/Button";
import { Modal } from "../../../shared/ui/Modal";
import { ETIQUETA_FORMA_PAGO, formatearFecha, formatearPrecio } from "../../../shared/utils/formato";
import { useAuthStore } from "../../../store/authStore";
import { PedidoDetalle } from "../components/PedidoDetalle";
import { useCancelarPedido, usePedidos } from "../hooks/usePedidos";

const LIMITE = 10;

export default function MisPedidosPage() {
  const [pagina, setPagina] = useState(0);
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const usuarioId = useAuthStore((s) => s.usuario?.id);
  const pedidos = usePedidos({ skip: pagina * LIMITE, limit: LIMITE });
  const cancelar = useCancelarPedido();

  const onCancelar = (id: number) => {
    if (window.confirm(`¿Cancelar el pedido #${id}?`)) cancelar.mutate(id);
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Mis pedidos</h1>

      {cancelar.isError && (
        <div className="mb-3">
          <EstadoError mensaje={handleApiError(cancelar.error)} />
        </div>
      )}

      {pedidos.isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : pedidos.isError ? (
        <EstadoError mensaje={handleApiError(pedidos.error)} />
      ) : !pedidos.data || pedidos.data.items.length === 0 ? (
        <EstadoVacio mensaje="Todavía no hiciste pedidos">
          <Link to="/" className="text-orange-600 hover:underline">
            Ir al catálogo
          </Link>
        </EstadoVacio>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-700">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Fecha</th>
                  <th className="px-4 py-2">Forma de pago</th>
                  <th className="px-4 py-2 text-right">Total</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pedidos.data.items.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2 font-medium">#{p.id}</td>
                    <td className="px-4 py-2">{formatearFecha(p.created_at)}</td>
                    <td className="px-4 py-2">{ETIQUETA_FORMA_PAGO[p.forma_pago]}</td>
                    <td className="px-4 py-2 text-right">{formatearPrecio(p.total)}</td>
                    <td className="px-4 py-2">
                      <BadgeEstado estado={p.estado} />
                    </td>
                    <td className="flex justify-end gap-2 px-4 py-2">
                      <Button variant="secondary" onClick={() => setDetalleId(p.id)}>
                        Ver detalle
                      </Button>
                      {p.estado === "PENDIENTE" && p.usuario_id === usuarioId && (
                        <Button
                          variant="danger"
                          disabled={cancelar.isPending && cancelar.variables === p.id}
                          onClick={() => onCancelar(p.id)}
                        >
                          Cancelar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Paginacion total={pedidos.data.total} pagina={pagina} limite={LIMITE} onCambiar={setPagina} />
        </>
      )}

      <Modal
        abierto={detalleId !== null}
        titulo={detalleId !== null ? `Pedido #${detalleId}` : ""}
        onCerrar={() => setDetalleId(null)}
      >
        {detalleId !== null && <PedidoDetalle id={detalleId} />}
      </Modal>
    </div>
  );
}
