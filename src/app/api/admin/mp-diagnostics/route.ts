// TEMPORAL: diagnóstico de MercadoPago (solo lectura). Borrar cuando se
// resuelva el problema de pagos.
import { timingSafeEqual } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { notifyOwnerNewOrder } from "@/lib/notify"

const MP_API = "https://api.mercadopago.com"

function hasSecret(req: NextRequest): boolean {
  const expected = process.env.STOCK_ADJUST_SECRET
  const given = req.headers.get("x-diagnostics-secret")
  if (!expected || !given) return false

  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

async function mp(path: string): Promise<{ http: number; data: any }> {
  const res = await fetch(`${MP_API}${path}`, {
    headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN || ""}` },
    cache: "no-store",
  })
  return { http: res.status, data: await res.json().catch(() => null) }
}

function host(url?: string | null) {
  try {
    return url ? new URL(url).host : null
  } catch {
    return url
  }
}

export async function GET(req: NextRequest) {
  if (!process.env.STOCK_ADJUST_SECRET) {
    return NextResponse.json({ error: "STOCK_ADJUST_SECRET no configurado" }, { status: 503 })
  }
  if (!hasSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // ?email=1 informa qué variables de email están cargadas; ?email=test además
  // envía una notificación de prueba al dueño.
  const emailParam = req.nextUrl.searchParams.get("email")
  if (emailParam) {
    const test =
      emailParam === "test"
        ? await notifyOwnerNewOrder({
            external_reference: "PRUEBA",
            customer_name: "Prueba de notificación",
            customer_email: "prueba@example.com",
            customer_phone: "",
            customer_address: "",
            customer_city: "",
            customer_province: "",
            items: [{ name: "Producto de prueba", quantity: 1, price: 100 }],
            total: 100,
          }).catch((e) => ({ sent: false, error: String(e?.message || e) }))
        : undefined
    return NextResponse.json({
      email: {
        resend_api_key: !!process.env.RESEND_API_KEY,
        owner_email: !!process.env.OWNER_EMAIL,
        resend_from: !!process.env.RESEND_FROM,
      },
      test,
    })
  }

  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN || ""
  const credential = token.startsWith("TEST-")
    ? "TEST"
    : token.startsWith("APP_USR-")
    ? "APP_USR"
    : token
    ? "desconocido"
    : "vacio"

  const me = await mp("/users/me")
  const account =
    me.http === 200
      ? {
          id: me.data.id,
          site_id: me.data.site_id,
          country_id: me.data.country_id,
          user_type: me.data.user_type,
          tags: me.data.tags,
          is_test_user: Array.isArray(me.data.tags) && me.data.tags.includes("test_user"),
          site_status: me.data.status?.site_status,
          sell: me.data.status?.sell,
        }
      : { http: me.http, error: me.data }

  const refParam = req.nextUrl.searchParams.get("ref")
  let refs = refParam ? refParam.split(",").filter(Boolean) : []
  if (refs.length === 0) {
    const { data } = await supabase
      .from("pedidos")
      .select("external_reference")
      .order("created_at", { ascending: false })
      .limit(3)
    refs = (data || []).map((o) => o.external_reference)
  }

  const orders = []
  for (const ref of refs) {
    const encoded = encodeURIComponent(ref)
    const payments = await mp(`/v1/payments/search?external_reference=${encoded}&sort=date_created&criteria=desc`)
    const merchantOrders = await mp(`/merchant_orders/search?external_reference=${encoded}`)

    const preferenceIds: string[] = [
      ...new Set<string>(
        (merchantOrders.data?.elements || []).map((m: any) => m.preference_id).filter(Boolean)
      ),
    ]
    const preferences = []
    for (const id of preferenceIds.slice(0, 2)) {
      const pref = await mp(`/checkout/preferences/${id}`)
      const d = pref.data || {}
      preferences.push(
        pref.http === 200
          ? {
              id: d.id,
              collector_id: d.collector_id,
              client_id: d.client_id,
              site_id: d.site_id,
              operation_type: d.operation_type,
              purpose: d.purpose,
              binary_mode: d.binary_mode,
              marketplace: d.marketplace,
              date_created: d.date_created,
              expires: d.expires,
              items: (d.items || []).map((i: any) => ({
                title: i.title,
                quantity: i.quantity,
                unit_price: i.unit_price,
                currency_id: i.currency_id,
              })),
              payer: {
                email_domain: d.payer?.email ? String(d.payer.email).split("@")[1] : null,
                has_name: !!d.payer?.name,
                phone: d.payer?.phone,
                address: d.payer?.address
                  ? {
                      has_street: !!d.payer.address.street_name,
                      street_number: d.payer.address.street_number,
                      zip_code: d.payer.address.zip_code,
                    }
                  : null,
                identification: d.payer?.identification,
              },
              payment_methods: d.payment_methods,
              auto_return: d.auto_return,
              back_urls: d.back_urls,
              notification_url: d.notification_url,
              init_point_host: host(d.init_point),
              sandbox_init_point_host: host(d.sandbox_init_point),
            }
          : { id, http: pref.http, error: d }
      )
    }

    orders.push({
      external_reference: ref,
      payments:
        payments.http === 200
          ? (payments.data?.results || []).map((p: any) => ({
              id: p.id,
              status: p.status,
              status_detail: p.status_detail,
              payment_type_id: p.payment_type_id,
              payment_method_id: p.payment_method_id,
              transaction_amount: p.transaction_amount,
              date_created: p.date_created,
              live_mode: p.live_mode,
              collector_id: p.collector_id,
              payer_id: p.payer?.id,
            }))
          : { http: payments.http, error: payments.data },
      merchant_orders:
        merchantOrders.http === 200
          ? (merchantOrders.data?.elements || []).map((m: any) => ({
              id: m.id,
              status: m.status,
              order_status: m.order_status,
              preference_id: m.preference_id,
              total_amount: m.total_amount,
              paid_amount: m.paid_amount,
              is_test: m.is_test,
              site_id: m.site_id,
              collector_id: m.collector?.id,
              payer_id: m.payer?.id,
              date_created: m.date_created,
              last_updated: m.last_updated,
              payments: (m.payments || []).map((p: any) => ({
                id: p.id,
                status: p.status,
                status_detail: p.status_detail,
                transaction_amount: p.transaction_amount,
              })),
            }))
          : { http: merchantOrders.http, error: merchantOrders.data },
      preferences,
    })
  }

  const recent = await mp("/v1/payments/search?sort=date_created&criteria=desc&limit=5")
  const recent_payments =
    recent.http === 200
      ? (recent.data?.results || []).map((p: any) => ({
          id: p.id,
          status: p.status,
          status_detail: p.status_detail,
          payment_method_id: p.payment_method_id,
          transaction_amount: p.transaction_amount,
          date_created: p.date_created,
          external_reference: p.external_reference,
          payer_id: p.payer?.id,
        }))
      : { http: recent.http, error: recent.data }

  return NextResponse.json({ credential, account, orders, recent_payments })
}
