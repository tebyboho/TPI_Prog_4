import { useState } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Paginacion } from "../../../shared/components/Paginacion";
import { Skeleton } from "../../../shared/components/Skeleton";
import { Button } from "../../../shared/ui/Button";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import { ProductoCard } from "../components/ProductoCard";
import { useProductos } from "../hooks/useProductos";

const LIMITE = 12;

export default function CatalogoPage() {
  const [pagina, setPagina] = useState(0);
  const [busquedaInput, setBusquedaInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);

  const categorias = useCategorias();
  const productos = useProductos({
    skip: pagina * LIMITE,
    limit: LIMITE,
    search: search || undefined,
    categoria_id: categoriaId,
  });

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Catálogo</h1>

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(busquedaInput.trim());
            setPagina(0);
          }}
        >
          <input
            type="search"
            placeholder="Buscar producto..."
            value={busquedaInput}
            onChange={(e) => setBusquedaInput(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <Button type="submit">Buscar</Button>
        </form>
        <select
          aria-label="Categoría"
          value={categoriaId ?? ""}
          onChange={(e) => {
            setCategoriaId(e.target.value ? Number(e.target.value) : undefined);
            setPagina(0);
          }}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Todas las categorías</option>
          {categorias.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {productos.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : productos.isError ? (
        <EstadoError mensaje={handleApiError(productos.error)} />
      ) : !productos.data || productos.data.items.length === 0 ? (
        <EstadoVacio mensaje="No hay productos que coincidan" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {productos.data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion total={productos.data.total} pagina={pagina} limite={LIMITE} onCambiar={setPagina} />
        </>
      )}
    </div>
  );
}
