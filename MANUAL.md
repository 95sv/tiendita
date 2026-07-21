# La Loya - Manual de Operación

## Índice

1. [Panel Admin - Acceso](#acceso)
2. [Gestión de Productos](#productos)
3. [Gestión de Pedidos](#pedidos)
4. [Gestión de Clientes](#clientes)
5. [Promociones y Descuentos](#promociones)
6. [Procesamiento de Pagos](#pagos)
7. [Cuándo falla algo - troubleshooting](#troubleshooting)
8. [Checklist diario/semanal](#checklist)

---

## 1. Acceso al Panel Admin

- **URL**: `https://laloya.vercel.app/admin`
- **Email**: `admin@laloya.com`
- **Contraseña**: `LaLoya2026!`

---

## 2. Gestión de Productos

### Crear un producto
1. Ir a **Productos** → **Nuevo producto**
2. Completar: nombre, descripción, precio (en ARS)
3. Seleccionar colección (Remeras, Pantalones, Camperas, etc.)
4. Agregar opciones: Talle (S, M, L, XL) y Color
5. Crear variantes para cada combinación talle+color
6. Subir imágenes (usar URLs de Unsplash o subir propias)
7. Guardar

### Cambiar estado de un producto
- **Publicado**: visible en la tienda
- **Borrador**: oculto de la tienda
- Hacer clic en el ojo (👁) para alternar

### Actualizar stock
1. Ir a **Productos** → seleccionar producto
2. Editar las variantes y actualizar `inventory_quantity`
3. Guardar

### Eliminar un producto
- Hacer clic en la papelera (🗑) → confirmar

---

## 3. Gestión de Pedidos

### Ver pedidos
- Ir a **Pedidos** en el sidebar
- Cada pedido muestra: referencia, cliente, estado, total, fecha

### Cambiar estado de un pedido
1. Hacer clic en el ojo (👁) para ver detalle
2. Usar los botones de estado:
   - **Aprobado** → pago confirmado, preparar envío
   - **Pendiente** → esperando confirmación de pago
   - **Rechazado** → pago no acreditado
   - **Cancelado** → cliente canceló
   - **Reembolsado** → devolución procesada
3. El estado se actualiza inmediatamente

### Exportar pedidos a Excel
- Hacer clic en **Exportar CSV** arriba a la derecha
- Se descarga un archivo `.csv` que se puede abrir en Excel

### Flujo normal de un pedido
```
Pendiente → Aprobado → (despachar) → Completado
```

### Si el webhook de MercadoPago no actualiza el estado
El estado queda en "Pendiente" después de que el cliente paga. Solución:
1. Ir a MercadoPago Dashboard → **Pagos**
2. Buscar el pago por el monto o email del cliente
3. Verificar que el estado sea "Aprobado"
4. En el panel de La Loya, abrir el pedido y cambiar a **Aprobado** manualmente

---

## 4. Gestión de Clientes

- Ir a **Clientes** en el sidebar
- Muestra: nombre, email, teléfono, cantidad de pedidos, gasto total
- Se actualiza automáticamente cuando se crea un pedido
- Se puede exportar a CSV

---

## 5. Promociones y Descuentos

### Crear una promoción
1. Ir a **Promociones** → **Nueva promoción**
2. Completar:
   - **Código**: ej. `VERANO2026` (se usa en mayúsculas)
   - **Tipo**: Porcentaje (%) o Monto fijo ($)
   - **Valor**: ej. `10` (para 10%) o `5000` (para $5000 off)
   - **Fechas** (opcional): inicio y fin de vigencia
3. Crear

### Eliminar una promoción
- Hacer clic en la papelera (🗑)

### Nota
Las promociones se crean en MedusaJS pero el checkout actual usa MercadoPago directo. Para aplicar descuentos reales, se necesita integrar el código de promoción en el checkout. Por ahora, las promociones sirven como registro interno.

---

## 6. Procesamiento de Pagos

### Cómo funciona
1. El cliente elige productos → carrito → checkout
2. Completa datos y elige "Mercado Pago"
3. Se redirige a MercadoPago para pagar
4. Al aprobarse, MercadoPago notifica al webhook
5. El pedido se guarda en Supabase como "Pendiente"
6. Si el webhook funciona, se actualiza a "Aprobado"
7. Si no, actualizar manualmente desde el admin

### Credenciales MercadoPago
- **Prueba (sandbox)**: para testear sin cobro real
- **Producción**: para cobrar de verdad
- Se cambian en Vercel → Environment Variables

### Tarjetas de prueba (modo sandbox)
| Campo | Valor |
|-------|-------|
| Número | `5031 7557 3453 0604` |
| Vencimiento | `11/25` |
| CVV | `123` |
| DNI | `12345678` |

### Transferencia bancaria
- El cliente elige "Transferencia bancaria" en el checkout
- Se le muestra un mensaje para coordinar por WhatsApp
- No se procesa automáticamente → crear pedido manual si confirma

---

## 7. Troubleshooting - Cuando falla algo

### La tienda no carga productos
**Causa probable**: Render (backend) está dormido (plan gratuito)
**Solución**:
1. Esperar 30-60 segundos y recargar
2. Si persiste, verificar: https://la-loya-backend.onrender.com/health
3. Si no responde, Render está despertándose, esperar 2 minutos
4. Si sigue fallando, contactar soporte de Render

### El admin no carga datos
**Causa**: Las llamadas a la API fallan
**Solución**:
1. Abrir consola del navegador (F12 → Console)
2. Buscar errores en rojo
3. Si dice "CORS" o "fetch failed", el backend puede estar caído
4. Si dice "401" o "403", cerrar sesión y volver a entrar

### El pago se queda en "Pendiente"
**Causa**: El webhook de MercadoPago no llegó
**Solución**:
1. Ir a MercadoPago Dashboard → Pagos
2. Verificar que el pago esté aprobado
3. Si está aprobado, cambiar estado manualmente en el admin

### El cliente no recibe email de confirmación
**Causa**: Resend no está configurado o la API key es inválida
**Solución**:
1. Verificar en Vercel que `RESEND_API_KEY` esté configurada
2. Verificar que el dominio de Resend esté verificado
3. Si no está configurado, el email se omite silenciosamente (el pedido igual se guarda)

### El stock no se descuenta
**Causa actual**: El stock se maneja manualmente
**Solución**: Actualizar el stock desde **Productos** → seleccionar → editar variantes

### MercadoPago muestra "Una de las partes es de prueba"
**Causa**: Mezcla de credenciales de prueba y producción
**Solución**:
1. Verificar que en Vercel las credenciales sean todas de prueba (empiezan con `TEST-`) o todas de producción (empiezan con `APP_USR-`)
2. No mezclar

### La página de producto no carga / muestra error
**Causa**: El handle del producto tiene caracteres especiales
**Solución**:
1. Ir al admin → Productos
2. Verificar que los handles sean ASCII (sin ñ, tildes, etc.)
3. Los handles se generan automáticamente al crear el producto

---

## 8. Checklist

### Diario (5 min)
- [ ] Revisar pedidos pendientes en el admin
- [ ] Cambiar a "Aprobado" los pagos confirmados en MercadoPago
- [ ] Responder consultas de WhatsApp

### Semanal (15 min)
- [ ] Revisar stock de productos más vendidos
- [ ] Verificar que las imágenes de los productos se carguen
- [ ] Revisar la sección de clientes para ver nuevos compradores
- [ ] Exportar CSV de pedidos para tener respaldo

### Antes de cambiar a producción
- [ ] Cambiar credenciales de MercadoPago de TEST a producción
- [ ] Verificar que Resend tenga el dominio verificado para emails
- [ ] Probar una compra real con tarjeta (monto bajo)
- [ ] Verificar que el webhook actualice el estado automáticamente
- [ ] Revisar que todos los productos tengan imágenes y precios correctos

---

## URLs importantes

| Servicio | URL |
|----------|-----|
| Tienda | https://laloya.vercel.app |
| Admin | https://laloya.vercel.app/admin |
| Backend MedusaJS | https://la-loya-backend.onrender.com |
| MercadoPago Dashboard | https://www.mercadopago.com.ar/developers/panel/app |
| Supabase Dashboard | https://supabase.com/dashboard/project/qtwivutgmrwiielyqoqp |
| Vercel Dashboard | https://vercel.com/dashboard |
| GitHub Repositorio | https://github.com/95sv/tiendita |

<!-- Last updated: 2026-07-21 13:38 -->
