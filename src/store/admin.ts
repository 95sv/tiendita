import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Product } from "@/types"
import { products as initialProducts } from "@/lib/products"

export interface AdminProduct extends Product {
  stock: number
  active: boolean
}

interface AdminStore {
  products: AdminProduct[]
  addProduct: (product: AdminProduct) => void
  updateProduct: (id: string, product: Partial<AdminProduct>) => void
  deleteProduct: (id: string) => void
  toggleActive: (id: string) => void
}

const defaultProducts: AdminProduct[] = initialProducts.map((p) => ({
  ...p,
  stock: Math.floor(Math.random() * 50) + 5,
  active: true,
}))

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      products: defaultProducts,

      addProduct: (product) => {
        set({ products: [...get().products, product] })
      },

      updateProduct: (id, updates) => {
        set({
          products: get().products.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })
      },

      deleteProduct: (id) => {
        set({ products: get().products.filter((p) => p.id !== id) })
      },

      toggleActive: (id) => {
        set({
          products: get().products.map((p) =>
            p.id === id ? { ...p, active: !p.active } : p
          ),
        })
      },
    }),
    {
      name: "la-loya-admin",
    }
  )
)
