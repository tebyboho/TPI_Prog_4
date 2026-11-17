import { useId, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, id, className = "", ...props }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={inputId}
        className={`rounded border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400 ${error ? "border-red-500" : "border-gray-300"} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
