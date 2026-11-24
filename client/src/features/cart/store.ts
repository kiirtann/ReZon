import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from './types';

const MAX_ITEM_QUANTITY = 99;

export interface CartState {
  items: CartItem[];
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.floor(quantity)));
}

/**
 * Client-side persisted cart store (ADR-003).
 * Stores ONLY `{ productId, quantity }[]` — never prices or totals.
 * The server recalculates prices, shipping, and stock via `/cart/validate`.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (productId, quantity = 1) =>
        set((state) => {
          const safeQty = clampQuantity(quantity);
          const existing = state.items.find((item) => item.productId === productId);

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.productId === productId
                  ? { ...item, quantity: Math.min(MAX_ITEM_QUANTITY, item.quantity + safeQty) }
                  : item,
              ),
            };
          }

          return {
            items: [...state.items, { productId, quantity: safeQty }],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),

      setQuantity: (productId, quantity) =>
        set((state) => {
          if (!Number.isFinite(quantity) || quantity <= 0) {
            return {
              items: state.items.filter((item) => item.productId !== productId),
            };
          }

          const safeQty = clampQuantity(quantity);
          return {
            items: state.items.map((item) =>
              item.productId === productId ? { ...item, quantity: safeQty } : item,
            ),
          };
        }),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'shoplearn-cart',
    },
  ),
);

/**
 * Selector returning the total number of units across all cart items.
 */
export function selectCartCount(state: CartState): number {
  return state.items.reduce((sum, item) => sum + item.quantity, 0);
}
