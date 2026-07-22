import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  const { data, error } = await supabase
    .from("pedidos")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Supabase error:", error)
    return NextResponse.json([], { status: 500 })
  }

  return NextResponse.json(data || [])
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json()

  if (!id || !status) {
    return NextResponse.json({ error: "Missing id or status" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("pedidos")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Supabase error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
