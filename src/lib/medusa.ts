const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "https://la-loya-backend.onrender.com"
const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || ""
const PROXY = "/api/admin/proxy"

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
  const res = await fetch(`${PROXY}${path}`, {
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
  const res = await fetch(`${PROXY}/auth/user/emailpass`, {
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
    "/admin/products?limit=100"
  )
  return data.products
}

export async function fetchProduct(id: string): Promise<MedusaProduct> {
  const data = await adminFetch<{ product: MedusaProduct }>(`/admin/products/${id}`)
  return data.product
}

const SALES_CHANNEL_ID = "sc_01KY07XRRAQ1HTB8XDMF1G9XZK"

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
  await assignToSalesChannel(data.product.id)
  return data.product
}

async function assignToSalesChannel(productId: string): Promise<void> {
  await adminFetch(
    `/admin/sales-channels/${SALES_CHANNEL_ID}/products`,
    {
      method: "POST",
      body: JSON.stringify({ add: [productId] }),
    }
  )
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
  const data = await fetch(`/api/products`).then((r) => r.json())
  return data || []
}

export async function storeFetchCollections(): Promise<MedusaCollection[]> {
  const data = await fetch(`${MEDUSA_URL}/store/product-categories`, {
    headers: headers(),
  }).then((r) => r.json())
  return data.product_categories || []
}

export interface MedusaOrder {
  id: string
  display_id: number
  status: string
  fulfillment_status: string
  payment_status: string
  total: number
  currency_code: string
  email: string
  created_at: string
  updated_at: string
  customer?: { id: string; email: string; first_name: string; last_name: string } | null
  shipping_address?: { city: string; country_code: string; address_1: string } | null
  items: {
    id: string
    title: string
    quantity: number
    unit_price: number
    total: number
  }[]
}

export async function fetchOrders(): Promise<MedusaOrder[]> {
  const data = await adminFetch<{ orders: MedusaOrder[]; count: number }>(
    "/admin/orders?limit=100"
  )
  return data.orders || []
}

export async function fetchOrder(id: string): Promise<MedusaOrder> {
  const data = await adminFetch<{ order: MedusaOrder }>(`/admin/orders/${id}`)
  return data.order
}

export interface MedusaPromotion {
  id: string
  code: string
  type: string
  value: number
  is_automatic: boolean
  starts_at: string | null
  ends_at: string | null
  created_at: string
  updated_at: string
  application_method?: {
    type: string
    value: number
  }
}

export async function fetchPromotions(): Promise<MedusaPromotion[]> {
  const data = await adminFetch<{ promotions: any[]; count: number }>(
    "/admin/promotions?limit=100&expand=application_method"
  )
  return (data.promotions || []).map((p: any) => ({
    ...p,
    value: p.application_method?.value ?? p.value ?? 0,
    type: p.application_method?.type ?? p.type ?? "standard",
  }))
}

export async function createPromotion(body: {
  code: string
  type: "percentage" | "fixed"
  value: number
  is_automatic?: boolean
  starts_at?: string
  ends_at?: string
}): Promise<MedusaPromotion> {
  const promoBody: any = {
    code: body.code,
    type: "standard",
    application_method: {
      type: body.type === "percentage" ? "percentage" : "fixed",
      value: body.value,
      target_type: "order",
    },
  }
  if (body.is_automatic) promoBody.is_automatic = true
  const data = await adminFetch<{ promotion: MedusaPromotion }>("/admin/promotions", {
    method: "POST",
    body: JSON.stringify(promoBody),
  })
  if (!data.promotion) throw new Error("Error al crear promocion")
  return data.promotion
}

export async function deletePromotion(id: string): Promise<void> {
  await adminFetch(`/admin/promotions/${id}`, { method: "DELETE" })
}

export interface MedusaPriceList {
  id: string
  name: string
  description: string | null
  type: string
  status: string
  starts_at: string | null
  ends_at: string | null
  created_at: string
}

export async function fetchPriceLists(): Promise<MedusaPriceList[]> {
  const data = await adminFetch<{ price_lists: MedusaPriceList[]; count: number }>(
    "/admin/price-lists?limit=100"
  )
  return data.price_lists || []
}

export async function createPriceList(body: {
  name: string
  description?: string
  type: string
  starts_at?: string
  ends_at?: string
}): Promise<MedusaPriceList> {
  const data = await adminFetch<{ price_list: MedusaPriceList }>("/admin/price-lists", {
    method: "POST",
    body: JSON.stringify(body),
  })
  return data.price_list
}

export async function deletePriceList(id: string): Promise<void> {
  await adminFetch(`/admin/price-lists/${id}`, { method: "DELETE" })
}

export interface MedusaCustomer {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  orders_count: number
  total_spent: number
  created_at: string
}

export async function fetchCustomers(): Promise<MedusaCustomer[]> {
  const data = await adminFetch<{ customers: MedusaCustomer[]; count: number }>(
    "/admin/customers?limit=100"
  )
  return data.customers || []
}

export interface MedusaReturn {
  id: string
  status: string
  order_id: string
  created_at: string
  items: { id: string; quantity: number; reason_id: string | null }[]
}

export async function fetchReturns(): Promise<MedusaReturn[]> {
  const data = await adminFetch<{ returns: MedusaReturn[]; count: number }>(
    "/admin/returns?limit=100"
  )
  return data.returns || []
}
