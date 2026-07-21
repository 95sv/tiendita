import { NextRequest, NextResponse } from "next/server"

let resend: import("resend").Resend | null = null
function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    const { Resend } = require("resend")
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

function buildOrderEmail(data: {
  name: string
  items: { name: string; size?: string; quantity: number; price: number }[]
  total: number
  address: string
  city: string
  province: string
}) {
  const itemsHtml = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:12px;border-bottom:1px solid #eee;font-family:Oswald,sans-serif;font-size:14px;text-transform:uppercase;">
            ${item.name}${item.size ? ` - Talle ${item.size}` : ""}
          </td>
          <td style="padding:12px;border-bottom:1px solid #eee;font-family:Oswald,sans-serif;font-size:14px;text-align:center;">
            ${item.quantity}
          </td>
          <td style="padding:12px;border-bottom:1px solid #eee;font-family:Oswald,sans-serif;font-size:14px;text-align:right;">
            $${(item.price * item.quantity).toLocaleString("es-AR")}
          </td>
        </tr>`
    )
    .join("")

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Oswald,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="text-align:center;margin-bottom:40px;">
          <h1 style="font-family:Pacifico,cursive;font-size:48px;color:#8B2500;margin:0;">La Loya</h1>
          <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.3em;color:#2C2C2C;margin-top:4px;">Ropa & Cafe</p>
        </div>
        <div style="background:#fff;padding:32px;margin-bottom:24px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="width:60px;height:60px;border-radius:50%;background:#dcfce7;display:inline-flex;align-items:center;justify-content:center;font-size:28px;">&#10003;</div>
          </div>
          <h2 style="font-family:Oswald,sans-serif;font-size:24px;text-transform:uppercase;letter-spacing:0.05em;color:#2C2C2C;text-align:center;">Compra confirmada</h2>
          <p style="font-size:14px;color:#666;text-align:center;margin-top:8px;">Gracias por tu compra, ${data.name}!</p>
        </div>
        <div style="background:#fff;padding:32px;margin-bottom:24px;">
          <h3 style="font-family:Oswald,sans-serif;font-size:14px;text-transform:uppercase;letter-spacing:0.15em;color:#8B2500;margin-bottom:16px;">Resumen del pedido</h3>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr>
                <th style="padding:8px 12px;border-bottom:2px solid #2C2C2C;font-family:Oswald,sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#999;text-align:left;">Producto</th>
                <th style="padding:8px 12px;border-bottom:2px solid #2C2C2C;font-family:Oswald,sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#999;text-align:center;">Cant.</th>
                <th style="padding:8px 12px;border-bottom:2px solid #2C2C2C;font-family:Oswald,sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#999;text-align:right;">Precio</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:16px 12px 0;font-family:Oswald,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:0.15em;color:#999;text-align:left;">Total</td>
                <td style="padding:16px 12px 0;font-family:Oswald,sans-serif;font-size:20px;font-weight:bold;color:#2C2C2C;text-align:right;">$${data.total.toLocaleString("es-AR")}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div style="background:#fff;padding:32px;margin-bottom:24px;">
          <h3 style="font-family:Oswald,sans-serif;font-size:14px;text-transform:uppercase;letter-spacing:0.15em;color:#8B2500;margin-bottom:16px;">Direccion de envio</h3>
          <p style="font-size:14px;color:#666;margin:0;">${data.address}</p>
          <p style="font-size:14px;color:#666;margin:4px 0 0;">${data.city}, ${data.province}</p>
        </div>
        <div style="text-align:center;padding:24px 0;">
          <p style="font-size:12px;color:#999;">Coordinaremos la entrega por WhatsApp.</p>
          <p style="font-size:12px;color:#999;margin-top:4px;">Preguntas? Escribinos a info@laloya.com</p>
        </div>
        <div style="text-align:center;padding-top:24px;border-top:1px solid #eee;">
          <p style="font-size:10px;color:#ccc;text-transform:uppercase;letter-spacing:0.15em;">La Loya - Bahia Blanca, Argentina</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, items, total, address, city, province } = body

    if (!items || !total) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY) {
      console.log("Resend API key not configured, skipping email")
      return NextResponse.json({ success: true, skipped: true })
    }

    const resendClient = getResend()

    if (!resendClient) {
      console.log("Resend API key not configured, skipping email")
      return NextResponse.json({ success: true, skipped: true })
    }

    const html = buildOrderEmail({ name: name || "Cliente", items, total, address, city, province })

    const result = await resendClient.emails.send({
      from: process.env.RESEND_FROM || "La Loya <onboarding@resend.dev>",
      to: "laloya.bb@gmail.com",
      subject: `La Loya - Confirmacion de compra`,
      html,
    })

    if (result.error) {
      console.error("Resend error:", result.error)
      return NextResponse.json({ success: false, error: result.error })
    }

    return NextResponse.json({ success: true, id: result.data?.id })
  } catch (error: any) {
    console.error("Email error:", error.message || error)
    return NextResponse.json({ success: false, error: error.message || "Unknown error" })
  }
}
