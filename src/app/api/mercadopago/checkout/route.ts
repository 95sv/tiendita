import { NextRequest, NextResponse } from "next/server"
import { Preference } from "mercadopago"
import { mpClient } from "@/lib/mercadopago"
import { supabase } from "@/lib/supabase"
import { resolveCheckoutItems } from "@/lib/checkout"
import { lookupCoupon } from "@/lib/promo"
import { couponApplies, couponUnitPrice, type Coupon } from "@/lib/coupon"

// Verificar el pedido contra Medusa puede tardar si el backend está dormido
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { items, name, email, address, city, postalCode, province, phone, promoCode } = await req.json()

    const resolved = await resolveCheckoutItems(items)
    if ("error" in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: resolved.status })
    }
    const { lines } = resolved

    // El cupón se vuelve a validar acá; del navegador solo se toma el código.
    // Si dejó de valer no se cobra un total distinto al que vio el cliente.
    let coupon: Coupon | null = null
    if (typeof promoCode === "string" && promoCode.trim()) {
      coupon = await lookupCoupon(promoCode).catch(() => null)
      if (!coupon) {
        return NextResponse.json(
          { error: `El cupón ${promoCode.trim().toUpperCase()} ya no es válido. Quitalo para continuar.` },
          { status: 409 }
        )
      }
      if (!lines.some((line) => couponApplies(coupon!, line.id))) {
        return NextResponse.json(
          { error: "El cupón no aplica a los productos del carrito." },
          { status: 409 }
        )
      }
    }

    const origin = req.headers.get("origin") || "https://laloya.vercel.app"
    const externalRef = `order_${Date.now()}`
    const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
    const unitPrices = lines.map((line) =>
      coupon ? couponUnitPrice(coupon, line.id, line.price) : line.price
    )
    const total = lines.reduce((sum, line, index) => sum + unitPrices[index] * line.quantity, 0)
    const discount = subtotal - total

    const orderItems = lines.map((line, index) => ({
      name: line.name + (line.size ? ` - Talle ${line.size}` : "") + (line.color && line.color !== "Único" ? ` - ${line.color}` : ""),
      quantity: line.quantity,
      price: unitPrices[index],
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
          unit_price: unitPrices[index],
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
      promo_code: coupon?.code || "",
      discount,
    })

    // sandbox_init_point es para credenciales TEST-; con credenciales APP_USR
    // (reales o de un usuario de prueba) se usa init_point.
    const sandbox = (process.env.MERCADO_PAGO_ACCESS_TOKEN || "").startsWith("TEST-")
    return NextResponse.json({ url: (sandbox && result.sandbox_init_point) || result.init_point })
  } catch (error) {
    console.error("MercadoPago error:", error)
    return NextResponse.json(
      { error: "Error creating preference" },
      { status: 500 }
    )
  }
}
