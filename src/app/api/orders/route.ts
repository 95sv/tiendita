import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Supabase error:", error)
    return NextResponse.json([], { status: 500 })
  }

  return NextResponse.json(data || [])
}
