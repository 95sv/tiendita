import { NextRequest, NextResponse } from "next/server"
import { resolveCheckoutItems } from "@/lib/checkout"

// Verificar el pedido contra Medusa puede tardar si el backend está dormido
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "")

    const { items, email, name, phone, address, city, postalCode, province } = await req.json()

    const resolved = await resolveCheckoutItems(items)
    if ("error" in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: resolved.status })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/carrito`,
      metadata: {
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
        customer_city: city,
        customer_postal_code: postalCode,
        customer_province: province,
      },
      line_items: resolved.lines.map((line) => ({
        price_data: {
          currency: "ars",
          product_data: {
            name: line.name + (line.size ? ` - Talle ${line.size}` : ""),
          },
          unit_amount: line.price,
        },
        quantity: line.quantity,
      })),
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe error:", error)
    return NextResponse.json(
      { error: "Error creating checkout session" },
      { status: 500 }
    )
  }
}
