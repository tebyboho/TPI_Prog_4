import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import { DataTable } from "../../../shared/components/DataTable";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Skeleton } from "../../../shared/components/Skeleton";
import { Button } from "../../../shared/ui/Button";
import { Modal } from "../../../shared/ui/Modal";
import { formatearPrecio } from "../../../shared/utils/formato";
import { ProductoForm } from "../components/ProductoForm";
import { StockForm } from "../components/StockForm";
import { useEliminarProducto, useProductos } from "../hooks/useProductos";
import type { Producto } from "../types";

type ModalState =
  | { tipo: "cerrado" }
  | { tipo: "crear" }
  | { tipo: "editar"; producto: Producto }
  | { tipo: "stock"; producto: Producto };

const TITULOS: Record<ModalState["tipo"], string> = {
  cerrado: "",
  crear: "Nuevo producto",
  editar: "Editar producto",
  stock: "Actualizar stock",
};

export default function AdminProductosPage() {
  const productos = useProductos({ skip: 0, limit: 100 });
  const eliminar = useEliminarProducto();
  const [modal, setModal] = useState<ModalState>({ tipo: "cerrado" });
  const cerrar = () => setModal({ tipo: "cerrado" });

  const onEliminar = (p: Producto) => {
    if (window.confirm(`¿Eliminar el producto "${p.nombre}"?`)) eliminar.mutate(p.id);
  };

  const columns: ColumnDef<Producto>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "nombre", header: "Nombre" },
    { id: "categoria", header: "Categoría", accessorFn: (p) => p.categoria.nombre },
    { accessorKey: "precio_base", header: "Precio", cell: ({ row }) => formatearPrecio(row.original.precio_base) },
    { accessorKey: "stock", header: "Stock" },
    { accessorKey: "disponible", header: "Disponible", cell: ({ row }) => (row.original.disponible ? "Sí" : "No") },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setModal({ tipo: "editar", producto: row.original })}>
            Editar
          </Button>
          <Button variant="secondary" onClick={() => setModal({ tipo: "stock", producto: row.original })}>
            Stock
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
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={() => setModal({ tipo: "crear" })}>Nuevo producto</Button>
      </div>

      {eliminar.isError && (
        <div className="mb-3">
          <EstadoError mensaje={handleApiError(eliminar.error)} />
        </div>
      )}

      {productos.isLoading ? (
        <Skeleton className="h-64" />
      ) : productos.isError ? (
        <EstadoError mensaje={handleApiError(productos.error)} />
      ) : !productos.data || productos.data.items.length === 0 ? (
        <EstadoVacio mensaje="No hay productos" />
      ) : (
        <DataTable data={productos.data.items} columns={columns} />
      )}

      <Modal abierto={modal.tipo !== "cerrado"} titulo={TITULOS[modal.tipo]} onCerrar={cerrar}>
        {modal.tipo === "crear" && <ProductoForm onExito={cerrar} />}
        {modal.tipo === "editar" && (
          <ProductoForm key={modal.producto.id} inicial={modal.producto} onExito={cerrar} />
        )}
        {modal.tipo === "stock" && <StockForm key={modal.producto.id} producto={modal.producto} onExito={cerrar} />}
      </Modal>
    </div>
  );
}
