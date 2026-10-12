import { NextRequest, NextResponse } from "next/server"
import { Payment } from "mercadopago"
import { mpClient } from "@/lib/mercadopago"
import { supabase } from "@/lib/supabase"
import { notifyOwnerNewOrder } from "@/lib/notify"

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "https://la-loya-backend.onrender.com"
const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY || ""

// El backend en Render puede tardar en despertar
export const maxDuration = 60

async function decrementStock(
  items: { variant_id: string; quantity: number }[],
  reference: string
) {
  const res = await fetch(`${MEDUSA_URL}/store/stock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": API_KEY,
    },
    body: JSON.stringify({
      items,
      reference,
      secret: process.env.STOCK_ADJUST_SECRET || "",
    }),
    signal: AbortSignal.timeout(50_000),
  })
  if (!res.ok) throw new Error(`Stock adjust failed: ${res.status}`)
  return res.json()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.type === "payment") {
      const paymentId = body.data?.id

      if (paymentId) {
        const payment = new Payment(mpClient)
        const paymentData = await payment.get({ id: paymentId })

        console.log("Payment received:", {
          id: paymentData.id,
          status: paymentData.status,
          external_reference: paymentData.external_reference,
          transaction_amount: paymentData.transaction_amount,
          payment_method: paymentData.payment_method_id,
        })

        if (paymentData.status === "approved") {
          const metadata = paymentData.metadata || {}

          const { data: existingOrder } = await supabase
            .from("pedidos")
            .select("status, items")
            .eq("external_reference", paymentData.external_reference)
            .maybeSingle()

          // Los items guardados al crear el checkout mandan; la metadata de MP es respaldo
          const items =
            Array.isArray(existingOrder?.items) && existingOrder.items.length > 0
              ? existingOrder.items
              : metadata.items
              ? JSON.parse(metadata.items)
              : []

          const approved = {
            external_reference: paymentData.external_reference,
            payment_id: String(paymentData.id),
            status: "approved",
            customer_name: metadata.customer_name || "",
            customer_email: metadata.customer_email || paymentData.payer?.email || "",
            customer_phone: metadata.customer_phone || "",
            customer_address: metadata.customer_address || "",
            customer_city: metadata.customer_city || "",
            customer_province: metadata.customer_province || "",
            customer_postal_code: metadata.customer_postal_code || "",
            items,
            total: paymentData.transaction_amount,
            currency: paymentData.currency_id || "ARS",
            payment_method: paymentData.payment_method_id || "",
            updated_at: new Date().toISOString(),
          }

          // MercadoPago repite las notificaciones: solo la que logra pasar el
          // pedido a "approved" avisa al dueño.
          let firstApproval = true
          if (existingOrder) {
            const { data: claimed } = await supabase
              .from("pedidos")
              .update(approved)
              .eq("external_reference", paymentData.external_reference)
              .neq("status", "approved")
              .select("external_reference")
            firstApproval = (claimed?.length || 0) > 0
          } else {
            await supabase.from("pedidos").upsert(approved, { onConflict: "external_reference" })
          }

          console.log("Order approved and saved:", paymentData.external_reference)

          if (firstApproval) {
            try {
              const notified = await notifyOwnerNewOrder({
                external_reference: approved.external_reference || "",
                customer_name: approved.customer_name,
                customer_email: approved.customer_email,
                customer_phone: approved.customer_phone,
                customer_address: approved.customer_address,
                customer_city: approved.customer_city,
                customer_province: approved.customer_province,
                customer_postal_code: approved.customer_postal_code,
                payment_id: approved.payment_id,
                payment_method: approved.payment_method,
                items,
                total: paymentData.transaction_amount || 0,
              })
              console.log("Owner notification:", JSON.stringify(notified))
            } catch (e) {
              console.error("Owner notification error:", e)
            }
          }

          const stockItems = items
            .filter((item: any) => item.variant_id)
            .map((item: any) => ({
              variant_id: item.variant_id,
              quantity: item.quantity,
            }))

          // El backend descuenta una sola vez por external_reference, así que se
          // llama en cada notificación; si falla, el 500 hace que MP reintente.
          if (stockItems.length > 0 && paymentData.external_reference) {
            try {
              const result = await decrementStock(stockItems, paymentData.external_reference)
              console.log("Stock adjusted:", JSON.stringify(result))
            } catch (e) {
              console.error("Stock adjust error:", e)
              return NextResponse.json({ error: "Stock adjust failed" }, { status: 500 })
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ received: true })
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" })
}
