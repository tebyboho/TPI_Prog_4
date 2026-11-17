import type { ColumnDef } from "@tanstack/react-table";
import { handleApiError } from "../../../shared/api/handleApiError";
import { DataTable } from "../../../shared/components/DataTable";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Skeleton } from "../../../shared/components/Skeleton";
import { Button } from "../../../shared/ui/Button";
import { useAuthStore } from "../../../store/authStore";
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from "../hooks/useUsuarios";
import type { UserPublic } from "../types";

export default function AdminUsuariosPage() {
  const usuarios = useUsuarios();
  const activar = useActivarUsuario();
  const desactivar = useDesactivarUsuario();
  const actualId = useAuthStore((s) => s.usuario?.id);
  const ocupado = activar.isPending || desactivar.isPending;
  const errorMutacion = activar.error ?? desactivar.error;

  const columns: ColumnDef<UserPublic>[] = [
    { accessorKey: "username", header: "Username" },
    { accessorKey: "full_name", header: "Nombre" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Rol" },
    {
      accessorKey: "disabled",
      header: "Estado",
      cell: ({ row }) =>
        row.original.disabled ? (
          <span className="text-red-600">Desactivado</span>
        ) : (
          <span className="text-green-600">Activo</span>
        ),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={!row.original.disabled || ocupado}
            onClick={() => activar.mutate(row.original.id)}
          >
            Activar
          </Button>
          {row.original.id !== actualId && (
            <Button
              variant="danger"
              disabled={row.original.disabled || ocupado}
              onClick={() => desactivar.mutate(row.original.id)}
            >
              Desactivar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Usuarios</h1>

      {errorMutacion && (
        <div className="mb-3">
          <EstadoError mensaje={handleApiError(errorMutacion)} />
        </div>
      )}

      {usuarios.isLoading ? (
        <Skeleton className="h-64" />
      ) : usuarios.isError ? (
        <EstadoError mensaje={handleApiError(usuarios.error)} />
      ) : !usuarios.data || usuarios.data.length === 0 ? (
        <EstadoVacio mensaje="No hay usuarios" />
      ) : (
        <DataTable data={usuarios.data} columns={columns} />
      )}
    </div>
  );
}
