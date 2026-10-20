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

function adminAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("medusa_admin_token") : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Rutas propias del panel (/api/orders, /api/customers): mandan el token de
// admin y, si la sesión venció, vuelven a la pantalla de login.
export async function adminApiFetch(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(path, {
    ...init,
    headers: { ...init?.headers, ...adminAuthHeaders() },
  })
  if (res.status === 401) {
    adminLogout()
    window.location.reload()
  }
  return res
}

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${PROXY}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...adminAuthHeaders(),
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
    "/admin/products-with-stock"
  )
  return data.products
}

export async function fetchProduct(id: string): Promise<MedusaProduct> {
  const data = await adminFetch<{ product: MedusaProduct }>(`/admin/products/${id}`)
  return data.product
}

const SALES_CHANNEL_ID = "sc_01KYJQ8CVRD3HKY51JZ2N4JVAP"

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

export async function setVariantsStock(
  items: { variant_id: string; quantity: number }[]
): Promise<void> {
  if (items.length === 0) return
  await adminFetch("/admin/stock", {
    method: "POST",
    body: JSON.stringify({ items }),
  })
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

export interface MedusaPromotionRule {
  id: string
  attribute: string
  operator: string
  values: { value: string }[]
}

export interface MedusaPromotion {
  id: string
  code: string
  type: string
  status: "draft" | "active" | "inactive"
  is_automatic: boolean
  created_at: string
  application_method?: {
    type: "percentage" | "fixed"
    value: number
    target_type: string
    target_rules?: MedusaPromotionRule[]
  } | null
  rules?: MedusaPromotionRule[]
}

export interface CouponInput {
  type: "percentage" | "fixed"
  value: number
  // null: todos los productos
  productIds: string[] | null
  active: boolean
}

// Mismo atributo que valida el backend en /store/coupons
const COUPON_PRODUCT_ATTRIBUTE = "items.product.id"

export function couponProductIds(promo: MedusaPromotion): string[] | null {
  const rule = promo.application_method?.target_rules?.find(
    (r) => r.attribute === COUPON_PRODUCT_ATTRIBUTE
  )
  return rule ? rule.values.map((v) => v.value) : null
}

// Las promociones creadas antes de los cupones (sobre el total del pedido,
// automáticas o con otras reglas) no se pueden usar en la tienda
export function isStoreCoupon(promo: MedusaPromotion): boolean {
  const method = promo.application_method
  const targetRules = method?.target_rules || []
  return (
    promo.type === "standard" &&
    !promo.is_automatic &&
    method?.target_type === "items" &&
    (promo.rules || []).length === 0 &&
    targetRules.every((r) => r.attribute === COUPON_PRODUCT_ATTRIBUTE)
  )
}

function productRules(productIds: string[] | null) {
  return productIds && productIds.length > 0
    ? [{ attribute: COUPON_PRODUCT_ATTRIBUTE, operator: "in", values: productIds }]
    : []
}

export async function fetchPromotions(): Promise<MedusaPromotion[]> {
  const data = await adminFetch<{ promotions: MedusaPromotion[] }>("/admin/promotions")
  return data.promotions || []
}

async function fetchPromotion(id: string): Promise<MedusaPromotion> {
  const data = await adminFetch<{ promotion: MedusaPromotion }>(`/admin/promotions/${id}`)
  return data.promotion
}

export async function createCoupon(code: string, input: CouponInput): Promise<MedusaPromotion> {
  const data = await adminFetch<{ promotion: MedusaPromotion }>("/admin/promotions", {
    method: "POST",
    body: JSON.stringify({
      code: code.trim().toUpperCase(),
      type: "standard",
      status: input.active ? "active" : "inactive",
      is_automatic: false,
      application_method: {
        type: input.type,
        value: input.value,
        target_type: "items",
        allocation: "each",
        // Medusa la exige con allocation "each"; el descuento lo calcula la tienda
        max_quantity: 1000,
        currency_code: "ars",
        target_rules: productRules(input.productIds),
      },
    }),
  })
  return data.promotion
}

export async function updateCoupon(
  promo: MedusaPromotion,
  input: CouponInput
): Promise<MedusaPromotion> {
  await adminFetch(`/admin/promotions/${promo.id}`, {
    method: "POST",
    body: JSON.stringify({
      status: input.active ? "active" : "inactive",
      application_method: { type: input.type, value: input.value },
    }),
  })

  const current = couponProductIds(promo)
  const next = input.productIds && input.productIds.length > 0 ? input.productIds : null
  const sameProducts =
    (current === null && next === null) ||
    (current !== null &&
      next !== null &&
      current.length === next.length &&
      current.every((id) => next.includes(id)))

  if (!sameProducts) {
    await adminFetch(`/admin/promotions/${promo.id}/target-rules/batch`, {
      method: "POST",
      body: JSON.stringify({
        create: productRules(next),
        delete: (promo.application_method?.target_rules || []).map((r) => r.id),
      }),
    })
  }

  return fetchPromotion(promo.id)
}

export async function setPromotionActive(id: string, active: boolean): Promise<MedusaPromotion> {
  await adminFetch(`/admin/promotions/${id}`, {
    method: "POST",
    body: JSON.stringify({ status: active ? "active" : "inactive" }),
  })
  return fetchPromotion(id)
}

export async function deletePromotion(id: string): Promise<void> {
  await adminFetch(`/admin/promotions/${id}`, { method: "DELETE" })
}

export interface MedusaPriceList {
  id: string
  title: string
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

export interface MedusaPriceListPrice {
  id: string
  amount: number
  currency_code: string
  price_set?: { variant?: { id: string } | null } | null
}

export async function fetchPriceListPrices(id: string): Promise<MedusaPriceListPrice[]> {
  const data = await adminFetch<{ prices: MedusaPriceListPrice[] }>(
    `/admin/price-lists/${id}/prices`
  )
  return data.prices || []
}

export async function createPriceList(body: {
  name: string
  description?: string
  type: string
  starts_at?: string
  ends_at?: string
  prices?: { variant_id: string; amount: number; currency_code: string }[]
}): Promise<MedusaPriceList> {
  const payload: any = {
    title: body.name,
    // Medusa exige la descripción aunque esté vacía
    description: body.description || "",
    type: body.type,
  }
  if (body.prices) payload.prices = body.prices
  const data = await adminFetch<{ price_list: MedusaPriceList }>("/admin/price-lists", {
    method: "POST",
    body: JSON.stringify(payload),
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
