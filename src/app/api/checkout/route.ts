import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "")

    const { items, email, name, phone, address, city, postalCode, province } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 })
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
      line_items: items.map((item: { name: string; price: number; quantity: number; size?: string }) => ({
        price_data: {
          currency: "ars",
          product_data: {
            name: item.name + (item.size ? ` - Talle ${item.size}` : ""),
          },
          unit_amount: item.price,
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
