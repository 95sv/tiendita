import { NextResponse } from "next/server"

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "https://la-loya-backend.onrender.com"

export async function GET() {
  try {
    const start = Date.now()
    const res = await fetch(`${MEDUSA_URL}/store/products?limit=1`, {
      headers: {
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || "",
      },
    })
    const ms = Date.now() - start
    return NextResponse.json({ status: "ok", backend: res.ok ? "awake" : "error", latency: ms })
  } catch {
    return NextResponse.json({ status: "ok", backend: "waking up..." })
  }
}
