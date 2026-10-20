# La Loya — Tienda online

Tienda de ropa con catálogo, carrito, pago por MercadoPago y panel de administración.

- Tienda: https://laloya.vercel.app
- Panel: https://laloya.vercel.app/admin
- Manual de uso para quien opera la tienda: [MANUAL.md](MANUAL.md)
- Notas técnicas para quien toca el código: [AGENTS.md](AGENTS.md)

## Arquitectura

| Pieza | Tecnología | Dónde corre | Qué guarda o hace |
|---|---|---|---|
| Frontend (este repo) | Next.js | Vercel | Tienda, panel admin y rutas `/api/*` |
| Backend | MedusaJS v2 (repo `la-loya-backend`) | Render | Productos, variantes, precios, stock, usuarios admin |
| Pedidos | Supabase (tabla `pedidos`) | Supabase | Pedidos y datos de los clientes |
| Pagos | MercadoPago Checkout Pro | MercadoPago | Cobro y aviso de pago (webhook) |
| Emails | Resend | Resend | Aviso al dueño por cada compra pagada |

El navegador solo habla con este frontend. Las claves secretas (MercadoPago, Supabase, Resend, secret de stock) viven en el servidor y nunca llegan al navegador.

## Flujo de una compra

1. **Catálogo.** La tienda pide los productos publicados al backend (`/store/products-stock`), con precio y stock de cada combinación de talle y color.
2. **Producto y carrito.** El cliente elige talle, color y cantidad. Lo que no tiene stock aparece deshabilitado. El carrito se guarda en el navegador.
3. **Checkout.** Si el cliente ingresa un cupón, la tienda lo valida en el backend (`/store/coupons`) y muestra el descuento en los productos a los que aplica. `POST /api/mercadopago/checkout` vuelve a consultar el catálogo y el cupón, y arma el pedido con el precio y el stock del servidor (`lib/checkout.ts`, `lib/coupon.ts`). Si el precio cambió, no hay stock, el cupón dejó de valer o el catálogo no responde, rechaza la compra con un mensaje. Si está todo bien, crea el pago en MercadoPago con los precios ya descontados, guarda el pedido como `pending` y redirige al cliente.
4. **Pago.** El cliente paga en MercadoPago.
5. **Webhook.** MercadoPago llama a `POST /api/webhooks/mercadopago`. La tienda le consulta el pago a MercadoPago con su propia clave (no confía en el contenido del aviso) y, si está aprobado:
   - pasa el pedido a `approved` (una sola vez, aunque el aviso se repita),
   - envía el email al dueño (`lib/notify.ts`),
   - descuenta el stock de cada variante en el backend (`POST /store/stock`), una sola vez por pedido.
6. **Vuelta a la tienda.** El cliente ve la pantalla de compra exitosa.

Si el backend está dormido cuando llega el webhook, la tienda responde con error y MercadoPago reintenta más tarde.

## Flujo del panel admin

1. **Ingreso.** El admin entra con su usuario de Medusa; el token queda en el navegador y se envía en cada pedido al servidor.
2. **Productos.** Alta, edición, baja y publicación pasan por `/api/admin/proxy/*`, que reenvía a la API admin de Medusa con el token.
3. **Stock.** La lista muestra el stock por talle y color. Al editar, la matriz se guarda con `POST /admin/stock` en el backend.
4. **Descuentos.** Cada producto tiene precio de lista y, opcionalmente, precio con descuento (una lista de precios de Medusa). La tienda muestra el precio tachado y el porcentaje.
5. **Cupones.** Se crean en Promociones como promociones de Medusa, para todos los productos o para los elegidos, y se activan o desactivan desde ahí.
6. **Exportación.** Productos, Pedidos, Clientes, Cupones y Listas de precio exportan CSV listo para Excel.
7. **Pedidos y clientes.** `/api/orders` y `/api/customers` leen Supabase y exigen un token de admin válido (`lib/admin-auth.ts`).

## Estructura

```
src/app/                  páginas de la tienda y del panel (/admin)
src/app/api/              rutas de servidor (checkout, webhook, pedidos, proxy admin)
src/lib/checkout.ts       arma el pedido con datos del servidor
src/lib/notify.ts         email al dueño
src/lib/admin-auth.ts     validación del token de admin
src/lib/medusa-store.ts   lectura del catálogo
src/lib/medusa.ts         llamadas del panel al backend
src/store/                estado del carrito y del panel
```

## Variables de entorno

Se cargan en Vercel (Settings → Environment Variables) y, para desarrollo, en `.env.local`. Ningún valor va en el repositorio.

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_MEDUSA_URL` | URL del backend |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_API_KEY` | Clave pública de Medusa |
| `NEXT_PUBLIC_MEDUSA_REGION_ID` | Región (Argentina, ARS) |
| `MERCADO_PAGO_ACCESS_TOKEN` | Clave privada de MercadoPago |
| `SUPABASE_URL` | Proyecto de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada de Supabase |
| `STOCK_ADJUST_SECRET` | Secret compartido con el backend para descontar stock |
| `RESEND_API_KEY` | Clave de Resend |
| `OWNER_EMAIL` | Email que recibe el aviso de cada compra |
| `RESEND_FROM` | Remitente; solo con dominio propio verificado en Resend |

Las variables sin `NEXT_PUBLIC_` son secretas: no agregarles ese prefijo.

## Desarrollo local

```bash
npm install
```

```bash
npm run dev
```

La tienda queda en http://localhost:3000. Con el `.env.local` habitual, el frontend local usa el backend y la base de producción: lo que se cambie en el panel es real.

El pago con MercadoPago no se puede completar contra `localhost`, porque MercadoPago necesita una dirección pública para avisar del pago. Para probarlo, usar el sitio desplegado.

Antes de subir cambios:

```bash
npx tsc --noEmit
```

```bash
npm run build
```

## Deploy

Cada push a `main` despliega en Vercel. El backend se despliega en Render con cada push a `main` de su repositorio. Si un cambio toca los dos, desplegar primero el backend.

## Seguridad

- Las rutas con datos de pedidos y clientes exigen sesión de admin.
- El stock solo se modifica con sesión de admin (`/admin/stock`) o con el secret del servidor (`/store/stock`).
- El checkout nunca usa precios ni descuentos enviados por el navegador.
- El webhook confirma cada pago consultando a MercadoPago.
- No guardar contraseñas, tokens ni claves en ningún archivo del repositorio: es público.

## Pendientes conocidos

- Los cupones no tienen límite de usos ni fecha de vencimiento: se desactivan a mano.
- No se pueden agregar ni quitar talles o colores de un producto ya creado.
- El cliente no recibe un email propio de la tienda (requiere dominio verificado en Resend).
- El costo de envío no se calcula: se coordina con el cliente.
