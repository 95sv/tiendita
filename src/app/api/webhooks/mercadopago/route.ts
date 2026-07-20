import { NextRequest, NextResponse } from "next/server"
import { Payment } from "mercadopago"
import { mpClient } from "@/lib/mercadopago"

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
          console.log("Payment approved for order:", paymentData.external_reference)
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
