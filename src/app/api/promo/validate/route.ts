import { NextRequest, NextResponse } from "next/server"
import { lookupCoupon } from "@/lib/promo"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")

  if (!code) {
    return NextResponse.json({ valid: false, error: "Codigo requerido" }, { status: 400 })
  }

  try {
    const coupon = await lookupCoupon(code)
    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Cupón inválido o vencido" })
    }
    return NextResponse.json({ valid: true, coupon })
  } catch (error) {
    console.error("Promo validation error:", error)
    return NextResponse.json({ valid: false, error: "No se pudo validar el cupón. Probá de nuevo." })
  }
}
