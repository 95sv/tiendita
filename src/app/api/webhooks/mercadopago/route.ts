import { NextRequest, NextResponse } from "next/server"
import { Payment } from "mercadopago"
import { mpClient } from "@/lib/mercadopago"
import { supabase } from "@/lib/supabase"

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

          await supabase.from("orders").upsert(
            {
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
              items: metadata.items || [],
              total: paymentData.transaction_amount,
              currency: paymentData.currency_id || "ARS",
              payment_method: paymentData.payment_method_id || "",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "external_reference" }
          )

          console.log("Order saved to Supabase:", paymentData.external_reference)
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
