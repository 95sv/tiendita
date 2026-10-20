// Cálculo de cupones compartido entre el checkout (navegador) y el servidor,
// para que el total que ve el cliente sea el mismo que se cobra.

export interface Coupon {
  code: string
  type: "percentage" | "fixed"
  value: number
  // null: aplica a todos los productos
  product_ids: string[] | null
}

export interface CouponLine {
  product_id: string
  price: number
  quantity: number
}

export function couponApplies(coupon: Coupon, productId: string): boolean {
  return coupon.product_ids === null || coupon.product_ids.includes(productId)
}

// Precio por unidad con el cupón aplicado, en pesos enteros. Nunca baja de $1
// porque MercadoPago no acepta ítems sin precio.
export function couponUnitPrice(coupon: Coupon, productId: string, price: number): number {
  if (!couponApplies(coupon, productId)) return price
  const discounted =
    coupon.type === "percentage" ? price * (1 - coupon.value / 100) : price - coupon.value
  return Math.min(price, Math.max(1, Math.round(discounted)))
}

export function couponDiscount(coupon: Coupon, lines: CouponLine[]): number {
  return lines.reduce(
    (sum, line) =>
      sum + (line.price - couponUnitPrice(coupon, line.product_id, line.price)) * line.quantity,
    0
  )
}

export function couponLabel(coupon: Pick<Coupon, "type" | "value">): string {
  return coupon.type === "percentage"
    ? `${coupon.value}%`
    : `$${coupon.value.toLocaleString("es-AR")} por unidad`
}
