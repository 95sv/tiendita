import { NextRequest, NextResponse } from "next/server"
import { Preference } from "mercadopago"
import { mpClient } from "@/lib/mercadopago"

export async function POST(req: NextRequest) {
  try {
    const { items, name, email, address, city, postalCode, province, phone } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 })
    }

    const origin = req.headers.get("origin") || "https://tiendita-weld.vercel.app"

    const preference = new Preference(mpClient)
    const result = await preference.create({
      body: {
        items: items.map((item: { id: string; name: string; price: number; quantity: number; size?: string }) => ({
          id: item.id,
          title: item.name + (item.size ? ` - Talle ${item.size}` : ""),
          quantity: item.quantity,
          unit_price: item.price,
          currency_id: "ARS",
        })),
        payer: {
          name: name || undefined,
          email: email || undefined,
          phone: phone ? { number: phone } : undefined,
          address: address ? { street_name: address, street_number: "0", zip_code: postalCode || "" } : undefined,
        },
        back_urls: {
          success: `${origin}/checkout/success`,
          failure: `${origin}/carrito`,
          pending: `${origin}/checkout/success`,
        },
        auto_return: "approved",
        notification_url: `${origin}/api/webhooks/mercadopago`,
        external_reference: `order_${Date.now()}`,
        statement_descriptor: "LA LOYA",
        metadata: {
          customer_name: name,
          customer_email: email,
          customer_address: address,
          customer_city: city,
          customer_postal_code: postalCode,
          customer_province: province,
          customer_phone: phone,
        },
      },
    })

    return NextResponse.json({ url: result.init_point })
  } catch (error) {
    console.error("MercadoPago error:", error)
    return NextResponse.json(
      { error: "Error creating preference" },
      { status: 500 }
    )
  }
}
