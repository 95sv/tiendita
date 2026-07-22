import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "https://la-loya-backend.onrender.com"
const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || ""

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")

  if (!code) {
    return NextResponse.json({ valid: false, error: "Codigo requerido" }, { status: 400 })
  }

  try {
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
      return NextResponse.json({ valid: false, error: "Codigo invalido" })
    }

    const data = await res.json()
    const promo = data.promotions?.[0]

    if (!promo || promo.status !== "active") {
      return NextResponse.json({ valid: false, error: "Codigo invalido o inactivo" })
    }

    const method = promo.application_method
    if (!method) {
      return NextResponse.json({ valid: false, error: "Promocion sin metodo de aplicacion" })
    }

    return NextResponse.json({
      valid: true,
      type: method.type,
      value: method.value,
      code: promo.code,
    })
  } catch (error) {
    console.error("Promo validation error:", error)
    return NextResponse.json({ valid: false, error: "Error al validar codigo" })
  }
}
