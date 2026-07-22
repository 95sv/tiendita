"use client"

import { create } from "zustand"
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  publishProduct,
  unpublishProduct,
  fetchCollections,
  fetchCategories,
  type MedusaProduct,
  type MedusaCollection,
  type MedusaCategory,
} from "@/lib/medusa"

export interface AdminProduct {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  subcategory?: string
  sizes: string[]
  colors: { name: string; hex: string }[]
  slug: string
  isNew?: boolean
  discount?: number
  stock: number
  active: boolean
  medusaId?: string
  collectionId?: string
  status?: "draft" | "published"
}

interface AdminStore {
  products: AdminProduct[]
  collections: MedusaCollection[]
  categories: MedusaCategory[]
  loading: boolean
  error: string | null
  loadProducts: () => Promise<void>
  loadCollections: () => Promise<void>
  loadCategories: () => Promise<void>
  addProduct: (product: AdminProduct) => Promise<void>
  updateProduct: (id: string, updates: Partial<AdminProduct>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  toggleActive: (id: string) => Promise<void>
}

function medusaToAdmin(p: MedusaProduct): AdminProduct {
  const price = p.variants?.[0]?.prices?.[0]?.amount || 0
  const allPrices = (p.variants || []).flatMap((v) => (v.prices || []).map((pr) => pr.amount)).filter((n) => n > 0)
  const maxPrice = allPrices.length > 1 ? Math.max(...allPrices) : undefined

  const sizeOption = p.options?.find((o) =>
    ["talle", "size", "talles", "sizes"].includes(o.title.toLowerCase())
  )
  const sizes = sizeOption?.values?.map((v) => v.value) || p.variants?.map((v) => v.title) || []

  const colorOption = p.options?.find((o) =>
    ["color", "colores", "colors"].includes(o.title.toLowerCase())
  )
  const colors = colorOption?.values?.map((v) => ({ name: v.value, hex: "#000000" })) || []

  const totalStock = (p.variants || []).reduce(
    (sum, v) => sum + (v.inventory_quantity || 0),
    0
  ) || 50

  return {
    id: p.id,
    name: p.title,
    description: p.description || "",
    price,
    originalPrice: maxPrice && maxPrice > price ? maxPrice : undefined,
    images: p.images?.map((img) => img.url) || (p.thumbnail ? [p.thumbnail] : []),
    category: p.collection?.title || "Sin categoría",
    subcategory: undefined,
    sizes,
    colors,
    slug: p.handle,
    isNew: false,
    stock: totalStock || 50,
    active: p.status === "published",
    medusaId: p.id,
    collectionId: p.collection_id || undefined,
    status: p.status,
  }
}

export const useAdminStore = create<AdminStore>()((set, get) => ({
  products: [],
  collections: [],
  categories: [],
  loading: false,
  error: null,

  loadProducts: async () => {
    set({ loading: true, error: null })
    try {
      const products = await fetchProducts()
      set({ products: products.map(medusaToAdmin), loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },

  loadCollections: async () => {
    try {
      const collections = await fetchCollections()
      set({ collections })
    } catch {}
  },

  loadCategories: async () => {
    try {
      const categories = await fetchCategories()
      set({ categories })
    } catch {}
  },

  addProduct: async (product) => {
    set({ loading: true, error: null })
    try {
      const sizeOption = product.sizes.length > 0 ? product.sizes : ["Único"]
      const created = await createProduct({
        title: product.name,
        description: product.description,
        options: [{ title: "Talle", values: sizeOption }],
        variants: sizeOption.map((s) => ({
          title: s,
          options: { Talle: s },
          prices: [{ amount: product.price, currency_code: "ars" }],
        })),
        images: product.images.map((url) => ({ url })),
        status: product.active ? "published" : "draft",
      })
      const adminProduct = medusaToAdmin(created)
      adminProduct.stock = product.stock
      set({ products: [...get().products, adminProduct], loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },

  updateProduct: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const existing = get().products.find((p) => p.id === id)
      if (existing?.medusaId) {
        const body: any = {}
        if (updates.name) body.title = updates.name
        if (updates.description) body.description = updates.description
        if (updates.active !== undefined) {
          body.status = updates.active ? "published" : "draft"
        }
        if (updates.category && updates.category !== existing.category) {
          const suffix = updates.category === "mujeres" ? " Mujer" : updates.category === "ofertas" ? " Ofertas" : ""
          const baseTitle = (existing.category === "mujeres" || existing.category === "ofertas")
            ? existing.categoryTitle?.replace(/ (Mujer|Ofertas)$/, "") || ""
            : existing.categoryTitle || ""
          const targetTitle = baseTitle + suffix
          let collections = get().collections
          if (collections.length === 0) {
            const { fetchCollections: fc } = await import("@/lib/medusa")
            collections = await fc()
          }
          let targetColl = collections.find((c) => c.title === targetTitle)
          if (!targetColl) {
            const { createCollection: cc } = await import("@/lib/medusa")
            targetColl = await cc(targetTitle)
            collections = [...collections, targetColl]
            set({ collections })
          }
          body.collection_id = targetColl.id
        }
        await updateProduct(existing.medusaId, body)
      }
      set({
        products: get().products.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
        loading: false,
      })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },

  deleteProduct: async (id) => {
    try {
      const existing = get().products.find((p) => p.id === id)
      if (existing?.medusaId) {
        await deleteProduct(existing.medusaId)
      }
      set({ products: get().products.filter((p) => p.id !== id) })
    } catch (e: any) {
      set({ error: e.message })
    }
  },

  toggleActive: async (id) => {
    const product = get().products.find((p) => p.id === id)
    if (!product) return
    const newActive = !product.active
    try {
      if (product.medusaId) {
        if (newActive) {
          await publishProduct(product.medusaId)
        } else {
          await unpublishProduct(product.medusaId)
        }
      }
      set({
        products: get().products.map((p) =>
          p.id === id ? { ...p, active: newActive } : p
        ),
      })
    } catch (e: any) {
      set({ error: e.message })
    }
  },
}))
