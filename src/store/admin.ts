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
  categoryTitle?: string
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

function medusaToAdmin(p: MedusaProduct, storePrices?: Map<string, { calculated: number; original: number }>): AdminProduct {
  const price = p.variants?.[0]?.prices?.[0]?.amount || 0

  const sp = storePrices?.get(p.id)
  const finalPrice = sp?.calculated ?? price
  const originalPrice = sp && sp.original > sp.calculated ? sp.original : undefined

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

  const catTitle = p.collection?.title?.toLowerCase() || ""
  let category: "hombres" | "mujeres" | "ofertas" = "hombres"
  if (catTitle.includes("mujer")) category = "mujeres"
  else if (catTitle.includes("oferta")) category = "ofertas"

  return {
    id: p.id,
    name: p.title,
    description: p.description || "",
    price: finalPrice,
    originalPrice,
    images: p.images?.map((img) => img.url) || (p.thumbnail ? [p.thumbnail] : []),
    category,
    categoryTitle: p.collection?.title || undefined,
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

      let storePrices: Map<string, { calculated: number; original: number }> | undefined
      try {
        const REGION_ID = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID || ""
        const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "https://la-loya-backend.onrender.com"
        const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || ""
        const storeRes = await fetch(`${MEDUSA_URL}/store/products?limit=100${REGION_ID ? `&region_id=${REGION_ID}` : ""}`, {
          headers: { "x-publishable-api-key": API_KEY },
          cache: "no-store",
        })
        if (storeRes.ok) {
          const storeData = await storeRes.json()
          storePrices = new Map()
          for (const sp of storeData.products || []) {
            const calc = sp.variants?.[0]?.calculated_price
            if (calc) {
              storePrices.set(sp.id, { calculated: calc.calculated_amount, original: calc.original_amount })
            }
          }
        }
      } catch {}

      set({ products: products.map((p) => medusaToAdmin(p, storePrices)), loading: false })
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

      let collectionId: string | undefined
      try {
        let collections = get().collections
        if (collections.length === 0) {
          const { fetchCollections: fc } = await import("@/lib/medusa")
          collections = await fc()
          set({ collections })
        }
        const suffix = product.category === "mujeres" ? " Mujer" : product.category === "ofertas" ? " Ofertas" : ""
        const targetTitle = (product.subcategory || product.name.split(" ")[0]) + suffix
        let targetColl = collections.find((c) => c.title === targetTitle)
        if (!targetColl) {
          const { createCollection: cc } = await import("@/lib/medusa")
          targetColl = await cc(targetTitle)
          collections = [...collections, targetColl]
          set({ collections })
        }
        collectionId = targetColl.id
      } catch {}

      const created = await createProduct({
        title: product.name,
        description: product.description,
        collection_id: collectionId,
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

        if (updates.images !== undefined && updates.images.length > 0) {
          body.images = updates.images.map((url: string) => ({ url }))
        }

        if (updates.price !== undefined) {
          const { fetchProduct: fp } = await import("@/lib/medusa")
          const full = await fp(existing.medusaId)
          const basePrice = (updates.originalPrice && updates.originalPrice > updates.price)
            ? updates.originalPrice
            : updates.price
          body.variants = (full.variants || []).map((v: any) => ({
            id: v.id,
            prices: [{ amount: basePrice, currency_code: "ars" }],
          }))
        }

        await updateProduct(existing.medusaId, body)

        if (updates.price !== undefined || updates.originalPrice !== undefined) {
          const newPrice = updates.price ?? existing.price
          const newOriginal = updates.originalPrice ?? existing.originalPrice
          const { fetchPriceLists: fpl, createPriceList: cpl, updatePriceList: upl, deletePriceList: dpl } = await import("@/lib/medusa")
          const lists = await fpl()
          const saleList = lists.find((l: any) => l.title === `Sale - ${existing.name}`)

          if (newOriginal && newOriginal > 0 && newPrice && newPrice > 0 && newOriginal > newPrice) {
            const { fetchProduct: fp2 } = await import("@/lib/medusa")
            const full2 = await fp2(existing.medusaId)
            const prices = (full2.variants || []).map((v: any) => ({
              variant_id: v.id,
              amount: newPrice,
              currency_code: "ars",
            }))
            if (saleList) {
              await upl(saleList.id, { prices })
            } else {
              await cpl({
                name: `Sale - ${existing.name}`,
                description: `Descuento para ${existing.name}`,
                type: "sale",
                prices,
              })
            }
          } else if (saleList) {
            await dpl(saleList.id)
          }
        }
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
