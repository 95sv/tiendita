import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { requireAdmin } from "@/lib/admin-auth"

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req)
  if (denied) return denied

  const { data: orders, error } = await supabase
    .from("pedidos")
    .select("customer_name, customer_email, customer_phone, total, created_at, status")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Supabase error:", error)
    return NextResponse.json([], { status: 500 })
  }

  const customerMap = new Map<string, {
    email: string
    name: string
    phone: string
    orders_count: number
    total_spent: number
    last_order: string
    last_status: string
  }>()

  for (const order of orders || []) {
    const email = order.customer_email
    if (!email) continue

    // Solo suma lo efectivamente cobrado: los pedidos pendientes no se pagaron
    const paid = order.status === "approved" ? order.total || 0 : 0

    const existing = customerMap.get(email)
    if (existing) {
      existing.orders_count++
      existing.total_spent += paid
      if (order.created_at > existing.last_order) {
        existing.last_order = order.created_at
        existing.last_status = order.status
      }
      if (!existing.name && order.customer_name) existing.name = order.customer_name
      if (!existing.phone && order.customer_phone) existing.phone = order.customer_phone
    } else {
      customerMap.set(email, {
        email,
        name: order.customer_name || "",
        phone: order.customer_phone || "",
        orders_count: 1,
        total_spent: paid,
        last_order: order.created_at,
        last_status: order.status,
      })
    }
  }

  const customers = Array.from(customerMap.values()).sort(
    (a, b) => b.last_order.localeCompare(a.last_order)
  )

  return NextResponse.json(customers)
}
