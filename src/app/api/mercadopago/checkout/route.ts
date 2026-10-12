import { NextRequest, NextResponse } from "next/server"
import { Preference } from "mercadopago"
import { mpClient } from "@/lib/mercadopago"
import { supabase } from "@/lib/supabase"
import { notifyOwnerNewOrder } from "@/lib/notify"
import { getAllProducts } from "@/lib/medusa-store"
import type { Product } from "@/types"

interface CheckoutItem {
  id: string
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
  variant_id?: string
}

export async function POST(req: NextRequest) {
  try {
    const { items, name, email, address, city, postalCode, province, phone, promoCode, discount } =
      (await req.json()) as { items?: CheckoutItem[] } & Record<string, any>

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 })
    }

    // Resuelve la variante (talle + color) de cada item y valida el stock.
    // Si Medusa no responde a tiempo no se bloquea la venta.
    const products = await Promise.race([
      getAllProducts(),
      new Promise<Product[]>((resolve) => setTimeout(() => resolve([]), 8000)),
    ])
    for (const item of items) {
      const product = products.find((p) => p.id === item.id)
      const sameSize = product?.variants?.filter((v) => v.size === item.size) || []
      const variant =
        product?.variants?.find((v) => v.id === item.variant_id) ??
        sameSize.find((v) => v.color === (item.color || "Único")) ??
        (sameSize.length === 1 ? sameSize[0] : undefined)
      if (!product || !variant) continue

      item.variant_id = variant.id
      if (variant.stock < item.quantity) {
        const detail = [`talle ${variant.size}`, variant.color !== "Único" ? variant.color : ""]
          .filter(Boolean)
          .join(", ")
        return NextResponse.json(
          {
            error:
              variant.stock > 0
                ? `Solo quedan ${variant.stock} de ${product.name} (${detail}).`
                : `${product.name} (${detail}) no tiene stock.`,
          },
          { status: 409 }
        )
      }
    }

    const origin = req.headers.get("origin") || "https://laloya.vercel.app"
    const externalRef = `order_${Date.now()}`
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const total = Math.max(0, subtotal - (discount || 0))

    const preference = new Preference(mpClient)
    const result = await preference.create({
      body: {
        items: items.map((item: { id: string; name: string; price: number; quantity: number; size?: string; color?: string }) => ({
          id: item.id,
          title: item.name + (item.size ? ` - Talle ${item.size}` : "") + (item.color && item.color !== "Único" ? ` - ${item.color}` : ""),
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
          items: JSON.stringify(items.map((item: { name: string; size?: string; color?: string; quantity: number; price: number; variant_id?: string }) => ({
            name: item.name + (item.size ? ` - Talle ${item.size}` : "") + (item.color && item.color !== "Único" ? ` - ${item.color}` : ""),
            quantity: item.quantity,
            price: item.price,
            variant_id: item.variant_id,
          }))),
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
      items: items.map((item: { name: string; size?: string; color?: string; quantity: number; price: number; variant_id?: string }) => ({
        name: item.name + (item.size ? ` - Talle ${item.size}` : "") + (item.color && item.color !== "Único" ? ` - ${item.color}` : ""),
        quantity: item.quantity,
        price: item.price,
        variant_id: item.variant_id,
      })),
      total,
      currency: "ARS",
      payment_method: "",
      promo_code: promoCode || "",
      discount: discount || 0,
    })

    notifyOwnerNewOrder({
      external_reference: externalRef,
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      customer_address: address,
      customer_city: city,
      customer_province: province,
      items: items.map((item: { name: string; size?: string; quantity: number; price: number }) => ({
        name: item.name + (item.size ? ` - Talle ${item.size}` : ""),
        quantity: item.quantity,
        price: item.price,
      })),
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
