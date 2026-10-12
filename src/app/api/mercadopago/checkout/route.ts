import { NextRequest, NextResponse } from "next/server"
import { Preference } from "mercadopago"
import { mpClient } from "@/lib/mercadopago"
import { supabase } from "@/lib/supabase"
import { notifyOwnerNewOrder } from "@/lib/notify"
import { resolveCheckoutItems } from "@/lib/checkout"
import { lookupPromo, discountFor } from "@/lib/promo"

// Verificar el pedido contra Medusa puede tardar si el backend está dormido
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { items, name, email, address, city, postalCode, province, phone, promoCode, discount: claimedDiscount } = await req.json()

    const resolved = await resolveCheckoutItems(items)
    if ("error" in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: resolved.status })
    }
    const { lines } = resolved

    const origin = req.headers.get("origin") || "https://laloya.vercel.app"
    const externalRef = `order_${Date.now()}`
    const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0)

    // El descuento se recalcula acá: lo que manda el navegador solo indica
    // que el cliente aplicó un código.
    let discount = 0
    let appliedCode = ""
    if (typeof promoCode === "string" && promoCode.trim() && Number(claimedDiscount) > 0) {
      const result = await lookupPromo(promoCode.trim()).catch(() => null)
      if (result && "promo" in result) {
        discount = discountFor(result.promo, subtotal)
        appliedCode = result.promo.code
      }
    }
    const total = Math.max(0, subtotal - discount)

    const orderItems = lines.map((line) => ({
      name: line.name + (line.size ? ` - Talle ${line.size}` : "") + (line.color && line.color !== "Único" ? ` - ${line.color}` : ""),
      quantity: line.quantity,
      price: line.price,
      variant_id: line.variant_id,
    }))

    // A MercadoPago solo se le mandan el teléfono y la dirección si están bien
    // formados (código postal de 4 dígitos o CPA)
    const phoneDigits = String(phone || "").replace(/\D/g, "")
    const zipCode = String(postalCode || "").trim()
    const validZip = /^(\d{4}|[A-Za-z]\d{4}[A-Za-z]{3})$/.test(zipCode)

    const preference = new Preference(mpClient)
    const result = await preference.create({
      body: {
        items: lines.map((line, index) => ({
          id: line.id,
          title: orderItems[index].name,
          quantity: line.quantity,
          unit_price: line.price,
          currency_id: "ARS",
        })),
        payer: {
          name: name || undefined,
          email: email || undefined,
          phone: phoneDigits.length >= 6 ? { number: phoneDigits } : undefined,
          address: address && validZip ? { street_name: address, street_number: "0", zip_code: zipCode } : undefined,
        },
        back_urls: {
          success: `${origin}/checkout/success`,
          failure: `${origin}/carrito`,
          pending: `${origin}/checkout/success`,
        },
        auto_return: "approved",
        notification_url: `${origin}/api/webhooks/mercadopago`,
        external_reference: externalRef,
        statement_descriptor: "LA LOYA",
        metadata: {
          customer_name: name,
          customer_email: email,
          customer_address: address,
          customer_city: city,
          customer_postal_code: postalCode,
          customer_province: province,
          customer_phone: phone,
          items: JSON.stringify(orderItems),
        },
      },
    })

    await supabase.from("pedidos").insert({
      external_reference: externalRef,
      status: "pending",
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      customer_address: address,
      customer_city: city,
      customer_province: province,
      customer_postal_code: postalCode,
      items: orderItems,
      total,
      currency: "ARS",
      payment_method: "",
      promo_code: appliedCode,
      discount,
    })

    notifyOwnerNewOrder({
      external_reference: externalRef,
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      customer_address: address,
      customer_city: city,
      customer_province: province,
      items: orderItems,
      total,
    }).catch(console.error)

    return NextResponse.json({ url: result.sandbox_init_point || result.init_point })
  } catch (error) {
    console.error("MercadoPago error:", error)
    return NextResponse.json(
      { error: "Error creating preference" },
      { status: 500 }
    )
  }
}
