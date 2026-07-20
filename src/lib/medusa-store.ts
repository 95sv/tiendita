import type { Product } from "@/types"
import type { MedusaProduct } from "./medusa"

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "https://la-loya-backend.onrender.com"
const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || ""

export function medusaToProduct(p: MedusaProduct): Product {
  const price = p.variants?.[0]?.prices?.[0]?.amount || 0
  const allPrices = p.variants?.flatMap((v) => v.prices.map((pr) => pr.amount)) || []
  const maxPrice = allPrices.length > 1 ? Math.max(...allPrices) : undefined

  const sizeOption = p.options?.find((o) =>
    ["talle", "size", "talles", "sizes"].includes(o.title.toLowerCase())
  )
  const sizes = sizeOption?.values?.map((v) => v.value) || p.variants?.map((v) => v.title) || []

  const colorOption = p.options?.find((o) =>
    ["color", "colores", "colors"].includes(o.title.toLowerCase())
  )
  const colors = colorOption?.values?.map((v) => ({ name: v.value, hex: "#000000" })) || []

  const categoryMap: Record<string, "hombres" | "mujeres" | "ofertas"> = {
    remeras: "hombres",
    remenas: "hombres",
    pantalones: "hombres",
    camperas: "hombres",
    accesorios: "mujeres",
    vestidos: "mujeres",
  }

  const catTitle = p.collection?.title?.toLowerCase() || ""
  const category: "hombres" | "mujeres" | "ofertas" =
    categoryMap[catTitle] || "hombres"

  return {
    id: p.id,
    name: p.title,
    description: p.description || "",
    price,
    originalPrice: maxPrice && maxPrice > price ? maxPrice : undefined,
    images: p.images?.map((img) => img.url) || (p.thumbnail ? [p.thumbnail] : []),
    category,
    sizes,
    colors,
    slug: p.handle,
    isNew: false,
    discount:
      maxPrice && maxPrice > price
        ? Math.round(((maxPrice - price) / maxPrice) * 100)
        : undefined,
  }
}

let cachedProducts: Product[] | null = null

export async function getAllProducts(): Promise<Product[]> {
  if (cachedProducts) return cachedProducts

  const res = await fetch(`${MEDUSA_URL}/store/products?limit=100`, {
    headers: {
      "x-publishable-api-key": API_KEY,
    },
    next: { revalidate: 60 },
  })

  if (!res.ok) return []

  const data = await res.json()
  const products = (data.products || []).map(medusaToProduct)
  cachedProducts = products
  return products
}

export async function getProductsByCategory(
  category: Product["category"]
): Promise<Product[]> {
  const all = await getAllProducts()
  return all.filter((p) => p.category === category)
}

export async function getNewProducts(): Promise<Product[]> {
  const all = await getAllProducts()
  return all.filter((p) => p.isNew)
}

export async function getSaleProducts(): Promise<Product[]> {
  const all = await getAllProducts()
  return all.filter((p) => p.discount && p.discount > 0)
}

export async function getProductBySlug(
  slug: string
): Promise<Product | undefined> {
  const all = await getAllProducts()
  return all.find((p) => p.slug === slug)
}
