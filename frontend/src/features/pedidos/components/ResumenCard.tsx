import { Card } from "../../../shared/ui/Card";

interface ResumenCardProps {
  titulo: string;
  valor: string | number;
  color?: string;
}

export function ResumenCard({ titulo, valor, color = "text-gray-900" }: ResumenCardProps) {
  return (
    <Card>
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{valor}</p>
    </Card>
  );
}
