import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, Product, Color } from "@/types"

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, size: string, color: Color) => void
  removeItem: (productId: string, size: string, colorName: string) => void
  updateQuantity: (productId: string, size: string, colorName: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, size, color) => {
        const items = get().items
        const existing = items.find(
          (item) =>
            item.product.id === product.id &&
            item.size === size &&
            item.color.name === color.name
        )

        if (existing) {
          set({
            items: items.map((item) =>
              item.product.id === product.id &&
              item.size === size &&
              item.color.name === color.name
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          })
        } else {
          set({ items: [...items, { product, quantity: 1, size, color }] })
        }
      },

      removeItem: (productId, size, colorName) => {
        set({
          items: get().items.filter(
            (item) =>
              !(
                item.product.id === productId &&
                item.size === size &&
                item.color.name === colorName
              )
          ),
        })
      },

      updateQuantity: (productId, size, colorName, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, colorName)
          return
        }
        set({
          items: get().items.map((item) =>
            item.product.id === productId &&
            item.size === size &&
            item.color.name === colorName
              ? { ...item, quantity }
              : item
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        )
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: "la-loya-cart",
    }
  )
)
