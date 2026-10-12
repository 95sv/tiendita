import { NextRequest, NextResponse } from "next/server"
import { lookupPromo } from "@/lib/promo"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")

  if (!code) {
    return NextResponse.json({ valid: false, error: "Codigo requerido" }, { status: 400 })
  }

  try {
    const result = await lookupPromo(code)
    if ("error" in result) {
      return NextResponse.json({ valid: false, error: result.error })
    }

    return NextResponse.json({
      valid: true,
      type: result.promo.type,
      value: result.promo.value,
      code: result.promo.code,
    })
  } catch (error) {
    console.error("Promo validation error:", error)
    return NextResponse.json({ valid: false, error: "Error al validar codigo" })
  }
}
