import { NextRequest, NextResponse } from "next/server"

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "https://la-loya-backend.onrender.com"

export async function POST(req: NextRequest) {
  try {
    const { items, mode } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 })
    }

    const res = await fetch(`${MEDUSA_URL}/store/stock/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        mode: mode || "decrement",
        secret: process.env.STOCK_ADJUST_SECRET || "",
      }),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error("Stock adjust proxy error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
