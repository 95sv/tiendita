<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# La Loya — Contexto del proyecto

E-commerce full-stack: Next.js frontend + MedusaJS v2 backend + Supabase.

## URLs
- Frontend (Vercel): `https://laloya.vercel.app`
- Backend (Render): `https://la-loya-backend.onrender.com`
- GitHub Frontend: `https://github.com/95sv/tiendita.git`
- GitHub Backend: `https://github.com/95sv/la-loya-backend.git`

## Comandos clave
- Frontend: `npm run dev`, `npm run build`, `npx tsc --noEmit`
- Backend: `npm run build` (en `la-loya-backend/apps/backend`)

## Arquitectura de stock (talle × color)
- Cada producto en Medusa tiene opciones `Talle` y `Color`; cada combinación es una variante.
- `lib/medusa-store.ts` mapea variantes con `inventory_quantity` a `Product.variants[]`.
- `lib/colors.ts` exporta `COLOR_PALETTE` (12 colores) y `hexForColor(name)`.
- El stock vive en los inventory levels de Medusa (uno por variante); si la variante no tiene level, el backend lo crea en la primera stock location.
- Admin: `/admin/productos` muestra el stock por talle × color; se edita vía matriz en `/admin/productos/[id]` y se persiste con `setVariantsStock(items)` → `POST /admin/stock` (backend, auth admin de Medusa vía el proxy). Los talles/colores se definen al crear el producto; editarlos después no está soportado.
- Compra: `/api/mercadopago/checkout` resuelve el `variant_id` de cada item (talle + color) y valida stock; el webhook de MercadoPago descuenta con `POST /store/stock` (backend) enviando `reference: external_reference`. El backend guarda la referencia en la metadata del inventory item, así que reintentos del webhook no descuentan dos veces.
- Las rutas `/store/*` de Medusa exigen el header `x-publishable-api-key`, también las custom.
- Secret: `STOCK_ADJUST_SECRET` en backend (`.env` y Render) y frontend (`.env.local` y Vercel), server-side, NO `NEXT_PUBLIC_`. Solo lo usa el webhook.

## Tipos
- `Product.variants?: ProductVariant[]` (`{ id, size, color, stock }`) — opcional por fallback en `lib/products.ts`.
- `CartItem.variantId?: string` — se resuelve en `product-info.tsx` desde size+color.

## Admin
- Auth vía Medusa token en `localStorage` (`medusa_admin_token`).
- Proxy: `/api/admin/proxy/[...path]` reenvía con `x-publishable-api-key` + `Authorization`.
- Categoría = colección Medusa (sufijo " Mujer" / " Ofertas").
- Las rutas propias con datos de pedidos (`/api/orders`, `/api/customers`) exigen el token de admin: `requireAdmin` (`lib/admin-auth.ts`) lo valida contra Medusa; desde el panel se llaman con `adminApiFetch`.

## Checkout
- `resolveCheckoutItems` (`lib/checkout.ts`) arma el pedido con nombre, precio y stock tomados de Medusa. Del navegador solo se toma producto, talle, color y cantidad; nunca usar precios ni descuentos que mande el cliente.
- Si el catálogo no responde, el checkout se rechaza (no hay precio confiable).
- `/api/send-order-email` arma el email desde el pedido guardado en `pedidos` (por `external_reference`).
- La URL de pago es `init_point`; `sandbox_init_point` solo se usa si el access token empieza con `TEST-`.

## Descuentos y cupones
- Descuento por producto: el precio base de las variantes es el precio de lista; el precio con descuento es una price list de Medusa tipo `sale` llamada `Sale - <nombre>`. El panel la crea al alta (`addProduct`) y la reemplaza al editar (`updateProduct`), siempre con `status: active`: sin status Medusa la crea en `draft` y el descuento no se aplica. `AdminProduct.price` es lo que paga el cliente y `originalPrice` el precio tachado. UI compartida en `components/admin/price-fields.tsx`.
- Cupones: son promociones de Medusa (`type: standard`, `target_type: items`, `allocation: each`) con una regla `items.product.id` `in` [ids] si aplican a productos elegidos, o sin reglas si aplican a todos. Se crean `active`/`inactive` (Medusa crea en `draft` si no se indica).
- `GET /store/coupons?code=` (backend) valida el cupón y devuelve `{ code, type, value, product_ids }` (`product_ids: null` = todos).
- El cálculo está en `lib/coupon.ts` y lo usan el checkout del navegador y el servidor: descuento por unidad sobre el precio actual (con oferta incluida), redondeado a pesos y nunca por debajo de $1. El servidor recalcula y cobra en MercadoPago el precio con cupón; si el cupón dejó de valer, rechaza el checkout.
- Medusa no registra el uso de los cupones (el flujo de compra no usa carritos de Medusa), así que no hay límite de usos.

## Exportación CSV
- `lib/export-csv.ts`: separador `;`, decimales con coma y BOM, para abrir con doble clic en Excel en español. Neutraliza celdas que empiezan con `= + - @`.
- Exportan: Productos (una fila por talle y color, respeta el filtro), Pedidos, Clientes, Cupones y Listas de precio.

## Notificación al dueño
- `notifyOwnerNewOrder` (`lib/notify.ts`) envía un email con Resend cuando el webhook de MercadoPago aprueba un pago por primera vez (no al crear el checkout). Se espera con `await`: en Vercel una promesa suelta se corta al responder.
- Variables (Vercel, server-side): `RESEND_API_KEY`, `OWNER_EMAIL` y opcional `RESEND_FROM`. Sin dominio verificado en Resend solo se puede enviar desde `onboarding@resend.dev` hacia el email de la cuenta de Resend.

## Backend Medusa
- `admin: { disable: true }` en medusa-config (API funciona, UI deshabilitada).
- Rate limiting + admin auth en `src/api/middlewares.ts`.
- Stock: lógica compartida en `src/utils/stock.ts`; `src/api/store/stock/route.ts` (POST, decrementa, auth por secret) y `src/api/admin/stock/route.ts` (POST, fija cantidades, auth admin).
- Catálogo con stock: `src/api/store/products-stock/route.ts` (solo publicados) y `src/api/admin/products-with-stock/route.ts`.
