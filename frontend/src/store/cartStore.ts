import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
}

interface CartState {
  items: CartItem[];
  agregar: (item: Omit<CartItem, "cantidad">, cantidad?: number) => void;
  quitar: (producto_id: number) => void;
  cambiarCantidad: (producto_id: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (item, cantidad = 1) =>
        set((s) => {
          const existe = s.items.some((i) => i.producto_id === item.producto_id);
          if (existe) {
            return {
              items: s.items.map((i) =>
                i.producto_id === item.producto_id ? { ...i, cantidad: i.cantidad + cantidad } : i,
              ),
            };
          }
          return { items: [...s.items, { ...item, cantidad }] };
        }),

      quitar: (producto_id) => set((s) => ({ items: s.items.filter((i) => i.producto_id !== producto_id) })),

      cambiarCantidad: (producto_id, cantidad) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.producto_id === producto_id ? { ...i, cantidad: Math.max(1, cantidad) } : i,
          ),
        })),

      vaciar: () => set({ items: [] }),

      total: () => get().items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0),
    }),
    { name: "foodstore-cart" },
  ),
);
