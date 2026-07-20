const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "https://la-loya-backend.onrender.com"
const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || ""

export interface MedusaProduct {
  id: string
  title: string
  description: string
  handle: string
  status: "draft" | "published"
  thumbnail: string | null
  collection_id: string | null
  collection?: { id: string; title: string } | null
  images: { id: string; url: string }[]
  options: { id: string; title: string; values: { id: string; value: string }[] }[]
  variants: {
    id: string
    title: string
    options: { id: string; option_id: string; value: string }[]
    prices: { id: string; amount: number; currency_code: string }[]
    inventory_quantity?: number
  }[]
  tags: { id: string; value: string }[]
  created_at: string
  updated_at: string
}

export interface MedusaCollection {
  id: string
  title: string
  handle: string
}

export interface MedusaCategory {
  id: string
  name: string
  handle: string
  is_active: boolean
}

function headers(extra?: Record<string, string>) {
  return {
    "x-publishable-api-key": API_KEY,
    "Content-Type": "application/json",
    ...extra,
  }
}

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("medusa_admin_token") : null
  const res = await fetch(`${MEDUSA_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Medusa API error: ${res.status}`)
  }
  return res.json()
}

export async function adminLogin(email: string, password: string): Promise<string> {
  const res = await fetch(`${MEDUSA_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error("Credenciales inválidas")
  const data = await res.json()
  const token = data.token
  if (typeof window !== "undefined") {
    localStorage.setItem("medusa_admin_token", token)
  }
  return token
}

export function adminLogout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("medusa_admin_token")
  }
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false
  return !!localStorage.getItem("medusa_admin_token")
}

export async function fetchProducts(): Promise<MedusaProduct[]> {
  const data = await adminFetch<{ products: MedusaProduct[] }>(
    "/admin/products?limit=100&status=draft,published"
  )
  return data.products
}

export async function fetchProduct(id: string): Promise<MedusaProduct> {
  const data = await adminFetch<{ product: MedusaProduct }>(`/admin/products/${id}`)
  return data.product
}

export async function createProduct(body: {
  title: string
  description?: string
  collection_id?: string
  category_ids?: string[]
  options: { title: string; values: string[] }[]
  variants: {
    title: string
    options: Record<string, string>
    prices: { amount: number; currency_code: string }[]
  }[]
  images?: { url: string }[]
  status?: "draft" | "published"
}): Promise<MedusaProduct> {
  const data = await adminFetch<{ product: MedusaProduct }>("/admin/products", {
    method: "POST",
    body: JSON.stringify(body),
  })
  return data.product
}

export async function updateProduct(
  id: string,
  body: Partial<{
    title: string
    description: string
    status: "draft" | "published"
    collection_id: string
    images: { url: string }[]
    options: { title: string; values: string[] }[]
    variants: {
      id?: string
      title: string
      options: Record<string, string>
      prices: { amount: number; currency_code: string }[]
    }[]
  }>
): Promise<MedusaProduct> {
  const data = await adminFetch<{ product: MedusaProduct }>(`/admin/products/${id}`, {
    method: "POST",
    body: JSON.stringify(body),
  })
  return data.product
}

export async function deleteProduct(id: string): Promise<void> {
  await adminFetch(`/admin/products/${id}`, { method: "DELETE" })
}

export async function publishProduct(id: string): Promise<MedusaProduct> {
  const data = await adminFetch<{ product: MedusaProduct }>(`/admin/products/${id}`, {
    method: "POST",
    body: JSON.stringify({ status: "published" }),
  })
  return data.product
}

export async function unpublishProduct(id: string): Promise<MedusaProduct> {
  const data = await adminFetch<{ product: MedusaProduct }>(`/admin/products/${id}`, {
    method: "POST",
    body: JSON.stringify({ status: "draft" }),
  })
  return data.product
}

export async function fetchCollections(): Promise<MedusaCollection[]> {
  const data = await adminFetch<{ collections: MedusaCollection[] }>(
    "/admin/collections?limit=100"
  )
  return data.collections
}

export async function createCollection(title: string): Promise<MedusaCollection> {
  const data = await adminFetch<{ collection: MedusaCollection }>("/admin/collections", {
    method: "POST",
    body: JSON.stringify({ title }),
  })
  return data.collection
}

export async function fetchCategories(): Promise<MedusaCategory[]> {
  const data = await adminFetch<{ product_categories: MedusaCategory[] }>(
    "/admin/product-categories?limit=100"
  )
  return data.product_categories
}

export async function createCategory(name: string): Promise<MedusaCategory> {
  const data = await adminFetch<{ product_category: MedusaCategory }>(
    "/admin/product-categories",
    {
      method: "POST",
      body: JSON.stringify({ name }),
    }
  )
  return data.product_category
}

export async function storeFetchProducts(): Promise<MedusaProduct[]> {
  const data = await fetch(`${MEDUSA_URL}/store/products?limit=100`, {
    headers: headers(),
  }).then((r) => r.json())
  return data.products || []
}

export async function storeFetchCollections(): Promise<MedusaCollection[]> {
  const data = await fetch(`${MEDUSA_URL}/store/product-categories`, {
    headers: headers(),
  }).then((r) => r.json())
  return data.product_categories || []
}
