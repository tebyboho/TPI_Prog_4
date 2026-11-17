import { Button } from "../ui/Button";

interface PaginacionProps {
  total: number;
  pagina: number; // 0-based
  limite: number;
  onCambiar: (pagina: number) => void;
}

export function Paginacion({ total, pagina, limite, onCambiar }: PaginacionProps) {
  const paginas = Math.max(1, Math.ceil(total / limite));
  return (
    <div className="mt-4 flex items-center justify-center gap-3">
      <Button variant="secondary" disabled={pagina <= 0} onClick={() => onCambiar(pagina - 1)}>
        Anterior
      </Button>
      <span className="text-sm text-gray-600">
        Página {pagina + 1} de {paginas}
      </span>
      <Button variant="secondary" disabled={pagina + 1 >= paginas} onClick={() => onCambiar(pagina + 1)}>
        Siguiente
      </Button>
    </div>
  );
}
