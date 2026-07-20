import type { Product } from "@/types"

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "https://la-loya-backend.onrender.com"
const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || ""

interface StoreProduct {
  id: string
  title: string
  description: string
  handle: string
  status: string
  thumbnail: string | null
  collection_id: string | null
  collection?: { id: string; title: string } | null
  images: { id: string; url: string }[]
  options: { id: string; title: string; values: { id: string; value: string }[] }[]
  variants: {
    id: string
    title: string
    options?: { id: string; option_id: string; value: string }[]
    prices?: { id: string; amount: number; currency_code: string }[]
    inventory_quantity?: number
  }[]
}

function medusaToProduct(p: StoreProduct): Product {
  const firstVariant = p.variants?.[0]
  const firstPrice = firstVariant?.prices?.[0]?.amount ?? 0
  const allPrices = (p.variants || [])
    .flatMap((v) => (v.prices || []).map((pr) => pr.amount))
    .filter((n) => n > 0)
  const maxPrice = allPrices.length > 1 ? Math.max(...allPrices) : undefined

  const sizeOption = p.options?.find((o) =>
    ["talle", "size", "talles", "sizes"].includes(o.title.toLowerCase())
  )
  const sizes = sizeOption?.values?.map((v) => v.value) || (p.variants || []).map((v) => v.title) || []

  const colorOption = p.options?.find((o) =>
    ["color", "colores", "colors"].includes(o.title.toLowerCase())
  )
  const colors = colorOption?.values?.map((v) => ({ name: v.value, hex: "#000000" })) || []

  const categoryMap: Record<string, "hombres" | "mujeres" | "ofertas"> = {
    remeras: "hombres",
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
    price: firstPrice,
    originalPrice: maxPrice && maxPrice > firstPrice ? maxPrice : undefined,
    images: (p.images || []).map((img) => img.url).filter(Boolean),
    category,
    sizes,
    colors,
    slug: p.handle,
    isNew: false,
    discount:
      maxPrice && maxPrice > firstPrice
        ? Math.round(((maxPrice - firstPrice) / maxPrice) * 100)
        : undefined,
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const res = await fetch(
    `${MEDUSA_URL}/store/products?limit=100&fields=id,title,description,handle,status,thumbnail,collection_id,collection,images,options,variants`,
    {
      headers: { "x-publishable-api-key": API_KEY },
    }
  )

  if (!res.ok) return []

  const data = await res.json()
  return (data.products || []).map(medusaToProduct)
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
