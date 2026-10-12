import { NextRequest, NextResponse } from "next/server"

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "https://la-loya-backend.onrender.com"

// Valida contra Medusa el token que manda el panel. Devuelve la respuesta de
// error a enviar, o null si quien llama es un admin.
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const authorization = req.headers.get("authorization")
  if (!authorization) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const res = await fetch(`${MEDUSA_URL}/admin/users/me`, {
      headers: { Authorization: authorization },
      cache: "no-store",
    })
    if (res.ok) return null
    if (res.status === 401 || res.status === 403) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  } catch (error) {
    console.error("Admin auth check error:", error)
  }

  return NextResponse.json({ error: "No se pudo verificar la sesión" }, { status: 503 })
}
