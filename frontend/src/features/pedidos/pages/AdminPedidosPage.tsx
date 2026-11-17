import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import { DataTable } from "../../../shared/components/DataTable";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Skeleton } from "../../../shared/components/Skeleton";
import { BadgeEstado } from "../../../shared/ui/BadgeEstado";
import { Button } from "../../../shared/ui/Button";
import { Modal } from "../../../shared/ui/Modal";
import { ETIQUETA_FORMA_PAGO, formatearFecha, formatearPrecio } from "../../../shared/utils/formato";
import { PedidoDetalle } from "../components/PedidoDetalle";
import { useCambiarEstadoPedido, usePedidos } from "../hooks/usePedidos";
import { ACCIONES, ESTADOS_PEDIDO, type EstadoPedido, type Pedido } from "../types";

const esEstado = (v: string): v is EstadoPedido => ESTADOS_PEDIDO.some((e) => e === v);

export default function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined);
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const pedidos = usePedidos({ skip: 0, limit: 100, estado });
  const cambiarEstado = useCambiarEstadoPedido();

  const onAccion = (p: Pedido, nuevo: EstadoPedido) => {
    if (nuevo === "CANCELADO" && !window.confirm(`¿Cancelar el pedido #${p.id}?`)) return;
    cambiarEstado.mutate({ id: p.id, estado: nuevo });
  };

  const columns: ColumnDef<Pedido>[] = [
    { accessorKey: "id", header: "#", cell: ({ row }) => `#${row.original.id}` },
    { accessorKey: "usuario_id", header: "Usuario" },
    { accessorKey: "created_at", header: "Fecha", cell: ({ row }) => formatearFecha(row.original.created_at) },
    {
      accessorKey: "forma_pago",
      header: "Forma de pago",
      cell: ({ row }) => ETIQUETA_FORMA_PAGO[row.original.forma_pago],
    },
    { accessorKey: "total", header: "Total", cell: ({ row }) => formatearPrecio(row.original.total) },
    { accessorKey: "estado", header: "Estado", cell: ({ row }) => <BadgeEstado estado={row.original.estado} /> },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setDetalleId(row.original.id)}>
            Ver detalle
          </Button>
          {ACCIONES[row.original.estado].map((a) => (
            <Button
              key={a.estado}
              variant={a.estado === "CANCELADO" ? "danger" : "primary"}
              disabled={cambiarEstado.isPending}
              onClick={() => onAccion(row.original, a.estado)}
            >
              {a.label}
            </Button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <select
          aria-label="Estado"
          value={estado ?? ""}
          onChange={(e) => setEstado(esEstado(e.target.value) ? e.target.value : undefined)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PREPARACION">En preparación</option>
          <option value="ENTREGADO">Entregado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      {cambiarEstado.isError && (
        <div className="mb-3">
          <EstadoError mensaje={handleApiError(cambiarEstado.error)} />
        </div>
      )}

      {pedidos.isLoading ? (
        <Skeleton className="h-64" />
      ) : pedidos.isError ? (
        <EstadoError mensaje={handleApiError(pedidos.error)} />
      ) : !pedidos.data || pedidos.data.items.length === 0 ? (
        <EstadoVacio mensaje="No hay pedidos" />
      ) : (
        <DataTable data={pedidos.data.items} columns={columns} />
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
