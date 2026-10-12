const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "https://la-loya-backend.onrender.com"
const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || ""

export interface Promo {
  code: string
  type: string
  value: number
}

export async function lookupPromo(code: string): Promise<{ promo: Promo } | { error: string }> {
  const res = await fetch(
    `${MEDUSA_URL}/store/promotions?code=${encodeURIComponent(code)}`,
    {
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": API_KEY,
      },
    }
  )

  if (!res.ok) {
    return { error: "Codigo invalido" }
  }

  const data = await res.json()
  const promo = data.promotions?.[0]

  if (!promo || promo.status !== "active") {
    return { error: "Codigo invalido o inactivo" }
  }

  const method = promo.application_method
  if (!method) {
    return { error: "Promocion sin metodo de aplicacion" }
  }

  return { promo: { code: promo.code, type: method.type, value: method.value } }
}

export function discountFor(promo: Promo, subtotal: number): number {
  if (promo.type === "percentage") {
    return Math.round((subtotal * promo.value) / 100)
  }
  return Math.min(promo.value, subtotal)
}
