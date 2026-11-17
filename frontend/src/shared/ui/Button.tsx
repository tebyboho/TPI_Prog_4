import type { ButtonHTMLAttributes } from "react";

type Variante = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variante;
}

const estilos: Record<Variante, string> = {
  primary: "bg-orange-600 text-white hover:bg-orange-700",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`rounded px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${estilos[variant]} ${className}`}
      {...props}
    />
  );
}
