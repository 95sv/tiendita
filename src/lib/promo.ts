import type { Coupon } from "@/lib/coupon"

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "https://la-loya-backend.onrender.com"
const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || ""

// Devuelve el cupón si existe y está vigente, o null si no es válido
export async function lookupCoupon(code: string): Promise<Coupon | null> {
  const res = await fetch(
    `${MEDUSA_URL}/store/coupons?code=${encodeURIComponent(code.trim().toUpperCase())}`,
    {
      headers: { "x-publishable-api-key": API_KEY },
      cache: "no-store",
    }
  )

  if (res.status === 400 || res.status === 404) return null
  if (!res.ok) throw new Error(`Coupon lookup failed: ${res.status}`)

  const data = await res.json()
  return data.coupon ?? null
}
