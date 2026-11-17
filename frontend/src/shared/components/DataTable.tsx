import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Button } from "../ui/Button";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pageSize?: number;
}

export function DataTable<T>({ data, columns, pageSize = 10 }: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize } },
    // Mantener la página actual cuando los datos se refrescan tras una mutación.
    autoResetPageIndex: false,
  });

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th key={header.id} className="px-4 py-2 text-left font-semibold text-gray-700">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Anterior
        </Button>
        <span className="text-sm text-gray-600">
          Página {table.getState().pagination.pageIndex + 1} de {Math.max(1, table.getPageCount())}
        </span>
        <Button variant="secondary" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}
