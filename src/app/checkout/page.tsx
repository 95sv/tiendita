"use client"

import { useState } from "react"
import { useCartStore } from "@/store/cart"
import { formatPrice } from "@/lib/utils"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const { items, getTotal } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("mp")
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    province: "",
  })

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-center">
        <h1 className="font-[family-name:var(--font-oswald)] text-3xl uppercase tracking-[0.05em] text-charcoal">
          No hay productos
        </h1>
        <Link
          href="/catalogo"
          className="mt-6 inline-flex items-center gap-2 font-[family-name:var(--font-oswald)] text-sm uppercase tracking-[0.1em] text-charcoal/50 hover:text-rust transition-colors"
        >
          <ArrowLeft size={14} />
          Volver al catalogo
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (paymentMethod === "transfer") {
      setError("La transferencia bancaria se coordina por WhatsApp. Escribinos para continuar tu pedido.")
      return
    }

    if (!form.name || !form.email || !form.address || !form.city) {
      setError("Completa todos los campos obligatorios.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/mercadopago/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            size: item.size,
          })),
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          province: form.province,
        }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || "Error al procesar el pago")
        setLoading(false)
      }
    } catch {
      setError("Error de conexion. Intentalo de nuevo.")
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <span className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.3em] text-rust">
          Checkout
        </span>
        <h1 className="font-[family-name:var(--font-oswald)] text-4xl uppercase tracking-[0.05em] text-charcoal mt-1">
          Finalizar compra
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <section>
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-[0.15em] text-charcoal mb-4">
                Datos personales
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nombre completo *"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                  className="input-retro w-full px-4 py-3 text-sm"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                  className="input-retro w-full px-4 py-3 text-sm"
                />
                <input
                  type="tel"
                  placeholder="Telefono"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="input-retro w-full px-4 py-3 text-sm"
                />
              </div>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-[0.15em] text-charcoal mb-4">
                Direccion de envio
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Direccion *"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  required
                  className="input-retro w-full px-4 py-3 text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Ciudad *"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    required
                    className="input-retro w-full px-4 py-3 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Codigo postal"
                    value={form.postalCode}
                    onChange={(e) => update("postalCode", e.target.value)}
                    className="input-retro w-full px-4 py-3 text-sm"
                  />
                </div>
                <select
                  value={form.province}
                  onChange={(e) => update("province", e.target.value)}
                  className="input-retro w-full px-4 py-3 text-sm"
                >
                  <option value="">Provincia</option>
                  <option value="Buenos Aires">Buenos Aires</option>
                  <option value="CABA">Ciudad Autonoma de Buenos Aires</option>
                  <option value="Cordoba">Cordoba</option>
                  <option value="Santa Fe">Santa Fe</option>
                </select>
              </div>
            </section>

            <section>
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-[0.15em] text-charcoal mb-4">
                Medio de pago
              </h2>
              <div className="space-y-2">
                <label className="card-retro flex items-center gap-3 p-4 cursor-pointer hover:shadow-retro-sm transition-all">
                  <input
                    type="radio"
                    name="payment"
                    value="mp"
                    checked={paymentMethod === "mp"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-rust"
                  />
                  <span className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider text-charcoal">
                    Mercado Pago
                  </span>
                  <span className="font-[family-name:var(--font-oswald)] text-[10px] text-charcoal/40 ml-auto">
                    Tarjeta, efectivo, transferencia
                  </span>
                </label>
                <label className="card-retro flex items-center gap-3 p-4 cursor-pointer hover:shadow-retro-sm transition-all">
                  <input
                    type="radio"
                    name="payment"
                    value="transfer"
                    checked={paymentMethod === "transfer"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-rust"
                  />
                  <span className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider text-charcoal">
                    Transferencia bancaria
                  </span>
                  <span className="font-[family-name:var(--font-oswald)] text-[10px] text-charcoal/40 ml-auto">
                    Coordinar por WhatsApp
                  </span>
                </label>
              </div>
            </section>

            {error && (
              <p className="font-[family-name:var(--font-oswald)] text-xs text-rust uppercase tracking-wider">
                {error}
              </p>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="card-retro sticky top-24 p-6">
              <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-[0.15em] text-charcoal">
                Tu pedido
              </h2>
              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}-${item.color.name}`}
                    className="flex gap-3 text-sm"
                  >
                    <div className="flex-1">
                      <p className="font-[family-name:var(--font-oswald)] text-xs uppercase tracking-wider text-charcoal">
                        {item.product.name}
                      </p>
                      <p className="text-[10px] text-charcoal/40 font-[family-name:var(--font-oswald)] uppercase tracking-wider">
                        {item.size} x{item.quantity}
                      </p>
                    </div>
                    <span className="font-[family-name:var(--font-oswald)] text-xs font-medium text-charcoal">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-charcoal/10 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal/50">Subtotal</span>
                  <span className="font-[family-name:var(--font-oswald)] text-charcoal">
                    {formatPrice(getTotal())}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal/50">Envio</span>
                  <span className="text-charcoal/30 text-xs font-[family-name:var(--font-oswald)] uppercase">
                    A coordinar
                  </span>
                </div>
                <div className="border-t border-charcoal/10 pt-2 flex justify-between text-base font-bold">
                  <span className="font-[family-name:var(--font-oswald)] uppercase tracking-wider text-charcoal">
                    Total
                  </span>
                  <span className="font-[family-name:var(--font-oswald)] text-charcoal">
                    {formatPrice(getTotal())}
                  </span>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-retro mt-6 flex h-12 w-full items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Confirmar compra"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
