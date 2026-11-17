import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { Skeleton } from "../../../shared/components/Skeleton";
import { formatearPrecio } from "../../../shared/utils/formato";
import { ResumenCard } from "../components/ResumenCard";
import { useResumenPedidos } from "../hooks/usePedidos";

export default function AdminResumenPage() {
  const { data, isLoading, isError, error } = useResumenPedidos();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Resumen</h1>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} />
      ) : data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard titulo="Pendientes" valor={data.pendientes} color="text-yellow-600" />
          <ResumenCard titulo="En preparación" valor={data.en_preparacion} color="text-blue-600" />
          <ResumenCard titulo="Entregados" valor={data.entregados} color="text-green-600" />
          <ResumenCard titulo="Cancelados" valor={data.cancelados} color="text-red-600" />
          <ResumenCard titulo="Pedidos de hoy" valor={data.pedidos_hoy} />
          <ResumenCard
            titulo="Ingresos (entregados)"
            valor={formatearPrecio(data.ingresos_entregados)}
            color="text-orange-600"
          />
        </div>
      ) : null}
    </div>
  );
}
