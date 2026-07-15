import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2026-06-24.dahlia",
    })

    const { items, email } = await req.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/carrito`,
      line_items: items.map((item: { product: { name: string; price: number }; quantity: number }) => ({
        price_data: {
          currency: "ars",
          product_data: {
            name: item.product.name,
          },
          unit_amount: item.product.price,
        },
        quantity: item.quantity,
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
