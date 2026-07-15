"use client"

import { useCartStore } from "@/store/cart"
import { formatPrice } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const { items, getTotal } = useCartStore()

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
          Volver al catálogo
        </Link>
      </div>
    )
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

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <section>
            <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-[0.15em] text-charcoal mb-4">
              Datos personales
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre completo"
                className="input-retro w-full px-4 py-3 text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                className="input-retro w-full px-4 py-3 text-sm"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                className="input-retro w-full px-4 py-3 text-sm"
              />
            </div>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-[0.15em] text-charcoal mb-4">
              Dirección de envío
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Dirección"
                className="input-retro w-full px-4 py-3 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Ciudad"
                  className="input-retro w-full px-4 py-3 text-sm"
                />
                <input
                  type="text"
                  placeholder="Código postal"
                  className="input-retro w-full px-4 py-3 text-sm"
                />
              </div>
              <select className="input-retro w-full px-4 py-3 text-sm">
                <option value="">Provincia</option>
                <option value="BA">Buenos Aires</option>
                <option value="CABA">Ciudad Autónoma de Buenos Aires</option>
                <option value="CB">Córdoba</option>
                <option value="SF">Santa Fe</option>
                <option value="BBL">Bahía Blanca</option>
              </select>
            </div>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-[0.15em] text-charcoal mb-4">
              Medio de pago
            </h2>
            <div className="space-y-2">
              <label className="card-retro flex items-center gap-3 p-4 cursor-pointer hover:shadow-retro-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                <input type="radio" name="payment" value="card" defaultChecked className="accent-rust" />
                <span className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider text-charcoal">
                  Tarjeta de crédito/débito
                </span>
              </label>
              <label className="card-retro flex items-center gap-3 p-4 cursor-pointer hover:shadow-retro-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                <input type="radio" name="payment" value="mp" className="accent-rust" />
                <span className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider text-charcoal">
                  Mercado Pago
                </span>
              </label>
              <label className="card-retro flex items-center gap-3 p-4 cursor-pointer hover:shadow-retro-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                <input type="radio" name="payment" value="transfer" className="accent-rust" />
                <span className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider text-charcoal">
                  Transferencia bancaria
                </span>
              </label>
            </div>
          </section>
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
                  <div className="h-14 w-12 flex-shrink-0 bg-cream-dark flex items-center justify-center text-[8px] text-charcoal/20 font-[family-name:var(--font-oswald)] uppercase">
                    img
                  </div>
                  <div className="flex-1">
                    <p className="font-[family-name:var(--font-oswald)] text-xs uppercase tracking-wider text-charcoal">
                      {item.product.name}
                    </p>
                    <p className="text-[10px] text-charcoal/40 font-[family-name:var(--font-oswald)] uppercase tracking-wider">
                      {item.size} · {item.color.name} · x{item.quantity}
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
                <span className="text-charcoal/50">Envío</span>
                <span className="text-charcoal/30 text-xs font-[family-name:var(--font-oswald)] uppercase">
                  Pendiente
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
            <button className="btn-retro mt-6 flex h-12 w-full items-center justify-center text-sm">
              Confirmar compra
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
