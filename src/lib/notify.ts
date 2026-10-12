let resendClient: any = null
function getResend() {
  if (!resendClient && process.env.RESEND_API_KEY) {
    const { Resend } = require("resend")
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export type NotifyResult = { sent: boolean; id?: string; error?: string }

export async function notifyOwnerNewOrder(order: {
  external_reference: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  customer_city: string
  customer_province: string
  customer_postal_code?: string
  payment_id?: string
  payment_method?: string
  items: { name: string; quantity: number; price: number }[]
  total: number
}): Promise<NotifyResult> {
  const resend = getResend()
  if (!resend) return { sent: false, error: "RESEND_API_KEY no configurada" }

  const ownerEmail = process.env.OWNER_EMAIL
  if (!ownerEmail) return { sent: false, error: "OWNER_EMAIL no configurada" }

  const address = [
    order.customer_address,
    order.customer_city,
    order.customer_province,
    order.customer_postal_code ? `CP ${order.customer_postal_code}` : "",
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join(", ")

  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:10px;border-bottom:1px solid #eee;font-family:Oswald,sans-serif;font-size:13px;text-transform:uppercase;">
            ${escapeHtml(item.name)}
          </td>
          <td style="padding:10px;border-bottom:1px solid #eee;font-family:Oswald,sans-serif;font-size:13px;text-align:center;">
            ${item.quantity}
          </td>
          <td style="padding:10px;border-bottom:1px solid #eee;font-family:Oswald,sans-serif;font-size:13px;text-align:right;">
            $${(item.price * item.quantity).toLocaleString("es-AR")}
          </td>
        </tr>`
    )
    .join("")

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Oswald,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
        <div style="text-align:center;margin-bottom:30px;">
          <h1 style="font-family:Pacifico,cursive;font-size:36px;color:#8B2500;margin:0;">La Loya</h1>
          <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.3em;color:#2C2C2C;margin-top:4px;">Nueva compra pagada</p>
        </div>
        <div style="background:#fff;padding:24px;margin-bottom:16px;border-left:4px solid #8B2500;">
          <h2 style="font-family:Oswald,sans-serif;font-size:16px;text-transform:uppercase;letter-spacing:0.05em;color:#2C2C2C;margin:0 0 12px 0;">
            Pedido ${escapeHtml(order.external_reference)}
          </h2>
          <p style="font-size:14px;color:#666;margin:4px 0;"><strong>Cliente:</strong> ${escapeHtml(order.customer_name || "Sin nombre")}</p>
          <p style="font-size:14px;color:#666;margin:4px 0;"><strong>Email:</strong> ${escapeHtml(order.customer_email)}</p>
          ${order.customer_phone ? `<p style="font-size:14px;color:#666;margin:4px 0;"><strong>Tel:</strong> ${escapeHtml(order.customer_phone)}</p>` : ""}
          ${address ? `<p style="font-size:14px;color:#666;margin:4px 0;"><strong>Direccion:</strong> ${address}</p>` : ""}
          ${order.payment_id ? `<p style="font-size:14px;color:#666;margin:4px 0;"><strong>Pago MercadoPago:</strong> ${escapeHtml(order.payment_id)}${order.payment_method ? ` (${escapeHtml(order.payment_method)})` : ""}</p>` : ""}
        </div>
        <div style="background:#fff;padding:24px;margin-bottom:16px;">
          <h3 style="font-family:Oswald,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:0.15em;color:#8B2500;margin:0 0 12px 0;">Productos</h3>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr>
                <th style="padding:8px 10px;border-bottom:2px solid #2C2C2C;font-family:Oswald,sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#999;text-align:left;">Producto</th>
                <th style="padding:8px 10px;border-bottom:2px solid #2C2C2C;font-family:Oswald,sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#999;text-align:center;">Cant.</th>
                <th style="padding:8px 10px;border-bottom:2px solid #2C2C2C;font-family:Oswald,sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#999;text-align:right;">Precio</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:14px 10px 0;font-family:Oswald,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:0.15em;color:#999;text-align:left;">Total</td>
                <td style="padding:14px 10px 0;font-family:Oswald,sans-serif;font-size:18px;font-weight:bold;color:#2C2C2C;text-align:right;">$${order.total.toLocaleString("es-AR")}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div style="text-align:center;padding:16px 0;">
          <a href="https://laloya.vercel.app/admin/pedidos" style="display:inline-block;background:#8B2500;color:#fff;font-family:Oswald,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:0.15em;padding:12px 24px;text-decoration:none;">
            Ver en el panel
          </a>
        </div>
        <div style="text-align:center;padding-top:16px;border-top:1px solid #eee;">
          <p style="font-size:10px;color:#ccc;text-transform:uppercase;letter-spacing:0.15em;">La Loya - Bahia Blanca, Argentina</p>
        </div>
      </div>
    </body>
    </html>
  `

  // Sin dominio propio verificado en Resend solo se puede enviar desde
  // onboarding@resend.dev y hacia el email de la cuenta de Resend.
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM || "La Loya <onboarding@resend.dev>",
    to: ownerEmail,
    subject: `La Loya - Nueva compra pagada: $${order.total.toLocaleString("es-AR")}`,
    html,
  })

  if (result.error) {
    return { sent: false, error: result.error.message || String(result.error) }
  }
  return { sent: true, id: result.data?.id }
}
