import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import { DataTable } from "../../../shared/components/DataTable";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Skeleton } from "../../../shared/components/Skeleton";
import { Button } from "../../../shared/ui/Button";
import { Modal } from "../../../shared/ui/Modal";
import { CategoriaForm } from "../components/CategoriaForm";
import { useCategorias, useEliminarCategoria } from "../hooks/useCategorias";
import type { Categoria } from "../types";

type ModalState = { tipo: "cerrado" } | { tipo: "crear" } | { tipo: "editar"; categoria: Categoria };

export default function AdminCategoriasPage() {
  const categorias = useCategorias();
  const eliminar = useEliminarCategoria();
  const [modal, setModal] = useState<ModalState>({ tipo: "cerrado" });
  const cerrar = () => setModal({ tipo: "cerrado" });

  const onEliminar = (c: Categoria) => {
    if (window.confirm(`¿Eliminar la categoría "${c.nombre}"?`)) eliminar.mutate(c.id);
  };

  const columns: ColumnDef<Categoria>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "nombre", header: "Nombre" },
    { accessorKey: "descripcion", header: "Descripción", cell: ({ row }) => row.original.descripcion ?? "—" },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setModal({ tipo: "editar", categoria: row.original })}>
            Editar
          </Button>
          <Button variant="danger" onClick={() => onEliminar(row.original)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button onClick={() => setModal({ tipo: "crear" })}>Nueva categoría</Button>
      </div>

      {eliminar.isError && (
        <div className="mb-3">
          <EstadoError mensaje={handleApiError(eliminar.error)} />
        </div>
      )}

      {categorias.isLoading ? (
        <Skeleton className="h-64" />
      ) : categorias.isError ? (
        <EstadoError mensaje={handleApiError(categorias.error)} />
      ) : !categorias.data || categorias.data.length === 0 ? (
        <EstadoVacio mensaje="No hay categorías" />
      ) : (
        <DataTable data={categorias.data} columns={columns} />
      )}

      <Modal
        abierto={modal.tipo !== "cerrado"}
        titulo={modal.tipo === "editar" ? "Editar categoría" : "Nueva categoría"}
        onCerrar={cerrar}
      >
        {modal.tipo === "crear" && <CategoriaForm onExito={cerrar} />}
        {modal.tipo === "editar" && (
          <CategoriaForm key={modal.categoria.id} inicial={modal.categoria} onExito={cerrar} />
        )}
      </Modal>
    </div>
  );
}
