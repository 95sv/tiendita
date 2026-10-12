# La Loya - Manual de Operación

## Índice

1. [Acceso al Panel Admin](#1-acceso-al-panel-admin)
2. [Gestión de Productos](#2-gestión-de-productos)
3. [Gestión de Pedidos](#3-gestión-de-pedidos)
4. [Gestión de Clientes](#4-gestión-de-clientes)
5. [Promociones y Descuentos](#5-promociones-y-descuentos)
6. [Procesamiento de Pagos](#6-procesamiento-de-pagos)
7. [Troubleshooting - Cuando falla algo](#7-troubleshooting---cuando-falla-algo)
8. [Checklist](#8-checklist)

---

## 1. Acceso al Panel Admin

- **URL**: `https://laloya.vercel.app/admin`
- **Usuario y contraseña**: se entregan por un canal privado. No anotarlos en este archivo ni en ningún archivo del repositorio: el repositorio es público.
- La sesión vence sola; cuando pasa, el panel vuelve a la pantalla de ingreso.
- Para cambiar la contraseña, ver el README del backend (`set-admin-password`).

---

## 2. Gestión de Productos

### Crear un producto
1. Ir a **Productos** → **Nuevo producto**
2. Completar nombre, descripción y precio (en pesos, sin centavos: `14000` es $14.000)
3. Elegir categoría (Hombres, Mujeres u Ofertas) y, si se quiere, subcategoría
4. Agregar las imágenes por URL
5. Cargar los talles y elegir los colores de la paleta
6. Completar el **stock por talle y color**
7. Guardar

Los talles y colores se definen al crear el producto. Después no se pueden agregar ni quitar: para cambiarlos hay que crear el producto de nuevo.

### Cambiar estado de un producto
- **Activo**: visible en la tienda
- **Inactivo**: oculto de la tienda
- Hacer clic en el botón de estado para alternar

### Ver y actualizar stock
- La lista de **Productos** muestra el stock de cada producto por talle y color; lo que está en 0 aparece en rojo. Se puede filtrar por Hombres, Mujeres y Ofertas.
- Para cambiarlo: lápiz (editar) → **Stock por talle y color** → completar las cantidades → **Guardar cambios**.
- Si aparece un mensaje de error al guardar, los cambios no quedaron guardados: copiar el mensaje y avisar.

### Stock automático en pagos
- Cuando MercadoPago aprueba un pago, se descuenta el stock del talle y color comprados.
- Si MercadoPago avisa dos veces del mismo pago, se descuenta una sola vez.
- El stock nunca baja de 0, y la tienda no deja comprar más unidades de las que hay.

### Paleta de colores estándar
Blanco, Negro, Gris, Azul, Rojo, Verde, Amarillo, Marrón, Rosa, Naranja, Beige, Bordó

### Eliminar un producto
- Hacer clic en la papelera → confirmar

---

## 3. Gestión de Pedidos

### Ver pedidos
- Ir a **Pedidos** en el menú
- Cada pedido muestra: referencia, cliente, estado, total y fecha

### Cambiar estado de un pedido
1. Hacer clic en el ojo para ver el detalle
2. Usar los botones de estado:
   - **Aprobado** → pago confirmado, preparar envío
   - **Pendiente** → el cliente abrió el pago pero todavía no se acreditó
   - **Rechazado** → pago no acreditado
   - **Cancelado** → cliente canceló
   - **Reembolsado** → devolución procesada

Cambiar el estado a mano **no** modifica el stock: si se aprueba o cancela un pedido manualmente, hay que ajustar el stock desde Productos.

### Exportar pedidos a Excel
- **Exportar CSV** arriba a la derecha; el archivo se abre en Excel

### Flujo normal de un pedido
```
Pendiente (cliente abre el pago) → Aprobado (pago acreditado, stock descontado, aviso por email) → despachar
```

Es normal que queden pedidos en **Pendiente**: son clientes que llegaron a MercadoPago y no terminaron de pagar.

---

## 4. Gestión de Clientes

- Ir a **Clientes** en el menú
- Muestra: nombre, email, teléfono, cantidad de pedidos y gasto total
- Se arma a partir de los pedidos; se puede exportar a CSV

---

## 5. Promociones y Descuentos

Los códigos de descuento todavía **no funcionan en la tienda**: se pueden crear desde **Promociones**, pero el checkout no los puede validar ni aplicar al cobro. Hasta que se implemente, no comunicar códigos a clientes.

Para poner un producto en oferta, usar el **precio original** al editarlo: la tienda muestra el precio tachado y el precio de oferta.

---

## 6. Procesamiento de Pagos

### Cómo funciona
1. El cliente elige productos → carrito → checkout
2. Completa sus datos y elige "Mercado Pago"
3. La tienda verifica precio y stock, guarda el pedido como **Pendiente** y lo envía a MercadoPago
4. Cuando el pago se acredita, MercadoPago le avisa a la tienda (webhook)
5. La tienda marca el pedido como **Aprobado**, descuenta el stock y le envía un email al dueño

### Credenciales de MercadoPago
- Se cargan en Vercel → Settings → Environment Variables → `MERCADO_PAGO_ACCESS_TOKEN`. Después de cambiarla hay que volver a desplegar.
- **Para probar**: el access token de producción (`APP_USR-...`) del *vendedor de prueba*.
- **Para cobrar de verdad**: el access token de producción (`APP_USR-...`) de la cuenta real del negocio.

### Cómo hacer una compra de prueba
1. Abrir la tienda en una ventana de incógnito
2. En MercadoPago, iniciar sesión con el **comprador de prueba** (no con el vendedor de prueba ni con una cuenta real)
3. Pagar con "Dinero en cuenta"

### Transferencia bancaria
- El cliente elige "Transferencia bancaria" en el checkout y se le indica coordinar por WhatsApp
- No genera pedido automáticamente

---

## 7. Troubleshooting - Cuando falla algo

### La tienda no carga productos
**Causa probable**: el backend en Render está dormido (plan gratuito)
1. Esperar 30-60 segundos y recargar
2. Verificar https://la-loya-backend.onrender.com/health
3. Si no responde después de 2 minutos, revisar el panel de Render

### El checkout dice "No pudimos verificar tu pedido"
La tienda no pudo consultar precios y stock porque el backend está dormido o caído. Reintentar en un minuto.

### El checkout dice que el precio cambió
El cliente tenía el producto en el carrito desde antes de un cambio de precio. Tiene que quitarlo y volver a agregarlo.

### El admin no carga datos
1. Si vuelve a la pantalla de ingreso, la sesión venció: ingresar de nuevo
2. Si la lista de productos muestra un cartel de error, copiar el mensaje
3. Si no carga nada, el backend puede estar dormido (ver arriba)

### El pago se queda en "Pendiente"
1. Verificar en MercadoPago que el pago esté aprobado
2. Si está aprobado y pasaron varios minutos, cambiar el estado a mano en el admin y ajustar el stock

### MercadoPago muestra "Oh, no, algo anduvo mal" o "Una de las partes es de prueba"
Se mezclaron cuentas de prueba y reales, o se intentó pagar con el propio vendedor. Con credenciales de prueba hay que pagar con el comprador de prueba, en incógnito. Con credenciales reales hay que pagar con una cuenta real distinta a la del negocio.

### No llega el email de aviso de compra
1. Verificar en Vercel `RESEND_API_KEY` y `OWNER_EMAIL`
2. Sin dominio propio verificado en Resend, el aviso solo puede llegar al email con el que se creó la cuenta de Resend, y `RESEND_FROM` tiene que estar vacía
3. Revisar la carpeta de spam
4. El pedido se guarda igual aunque el email falle

### El stock no se descuenta
1. Verificar que el pedido haya pasado a "Aprobado" (si sigue pendiente, el pago no se acreditó)
2. Verificar que `STOCK_ADJUST_SECRET` tenga el mismo valor en Vercel y en Render
3. Si el backend estaba dormido, MercadoPago reintenta el aviso solo

---

## 8. Checklist

### Diario (5 min)
- [ ] Revisar los pedidos aprobados y despacharlos
- [ ] Responder consultas de WhatsApp

### Semanal (15 min)
- [ ] Revisar en Productos qué talles y colores quedaron en 0
- [ ] Verificar que las imágenes de los productos se carguen
- [ ] Exportar el CSV de pedidos para tener respaldo

### Antes de abrir la tienda al público
- [ ] Cambiar la contraseña del admin
- [ ] Reemplazar las credenciales de MercadoPago por las de la cuenta real del negocio
- [ ] Configurar el aviso por email (Resend)
- [ ] Cargar productos, precios y stock reales; borrar los de prueba
- [ ] Borrar los pedidos de prueba
- [ ] Hacer una compra real de monto bajo y verificar pedido aprobado, stock y email

---

## URLs importantes

| Servicio | URL |
|----------|-----|
| Tienda | https://laloya.vercel.app |
| Admin | https://laloya.vercel.app/admin |
| Backend MedusaJS | https://la-loya-backend.onrender.com |
| MercadoPago Developers | https://www.mercadopago.com.ar/developers/panel/app |
| Supabase | https://supabase.com/dashboard |
| Vercel | https://vercel.com/dashboard |
| Resend | https://resend.com |

<!-- Last updated: 2026-10-12 -->
