import type { ReactNode } from "react";

interface EstadoVacioProps {
  mensaje: string;
  children?: ReactNode;
}

export function EstadoVacio({ mensaje, children }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
      <p>{mensaje}</p>
      {children}
    </div>
  );
}
