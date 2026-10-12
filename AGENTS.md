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
- Admin edita stock vía matriz en `/admin/productos/[id]`; se persiste a Medusa con `updateVariantStock(id, qty, "set")`.
- Webhook de MercadoPago descuenta stock con `mode: "decrement"` en `POST /store/stock/adjust` (backend), idempotente chequeando `status` previo.
- Secret: `STOCK_ADJUST_SECRET` en backend `.env` y `NEXT_PUBLIC_STOCK_ADJUST_SECRET` en frontend `.env.local`.

## Tipos
- `Product.variants?: ProductVariant[]` (`{ id, size, color, stock }`) — opcional por fallback en `lib/products.ts`.
- `CartItem.variantId?: string` — se resuelve en `product-info.tsx` desde size+color.

## Admin
- Auth vía Medusa token en `localStorage` (`medusa_admin_token`).
- Proxy: `/api/admin/proxy/[...path]` reenvía con `x-publishable-api-key` + `Authorization`.
- Categoría = colección Medusa (sufijo " Mujer" / " Ofertas").

## Backend Medusa
- `admin: { disable: true }` en medusa-config (API funciona, UI deshabilitada).
- Rate limiting + admin auth en `src/api/middlewares.ts`.
- Endpoint custom: `src/api/store/stock/route.ts` (POST, auth por secret).
