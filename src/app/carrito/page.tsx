"use client"

import Link from "next/link"
import Image from "next/image"
import { useCartStore } from "@/store/cart"
import { formatPrice } from "@/lib/utils"
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, getItemCount } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-center">
        <span className="font-[family-name:var(--font-pacifico)] text-6xl text-charcoal/10">
          🛒
        </span>
        <h1 className="font-[family-name:var(--font-oswald)] text-3xl uppercase tracking-[0.05em] text-charcoal mt-6">
          Tu carrito está vacío
        </h1>
        <p className="mt-3 text-sm text-charcoal/50">
          Agregá productos para empezar a comprar
        </p>
        <Link
          href="/catalogo"
          className="btn-retro mt-8 inline-flex items-center gap-2 px-8 py-3 text-sm"
        >
          <ArrowLeft size={16} />
          Ver catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <span className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.3em] text-rust">
          Carrito
        </span>
        <h1 className="font-[family-name:var(--font-oswald)] text-4xl uppercase tracking-[0.05em] text-charcoal mt-1">
          Tu carrito
        </h1>
        <p className="mt-2 font-[family-name:var(--font-oswald)] text-sm text-charcoal/40 uppercase tracking-[0.1em]">
          {getItemCount()} productos
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <motion.div
              key={`${item.product.id}-${item.size}-${item.color.name}`}
              layout
              className="card-retro flex gap-4 p-4"
            >
              <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden bg-cream-dark">
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-[0.05em] text-charcoal">
                  {item.product.name}
                </h3>
                <p className="text-xs text-charcoal/40 mt-1 font-[family-name:var(--font-oswald)] uppercase tracking-wider">
                  Talle {item.size} · {item.color.name}
                </p>
                <p className="font-[family-name:var(--font-oswald)] text-sm font-semibold mt-2 text-charcoal">
                  {formatPrice(item.product.price)}
                </p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() =>
                    removeItem(item.product.id, item.size, item.color.name)
                  }
                  className="p-1 text-charcoal/30 hover:text-rust transition-colors"
                >
                  <Trash2 size={14} />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.product.id,
                        item.size,
                        item.color.name,
                        item.quantity - 1
                      )
                    }
                    className="h-7 w-7 flex items-center justify-center border border-charcoal/20 hover:border-charcoal transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-4 text-center text-xs font-[family-name:var(--font-oswald)] font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.product.id,
                        item.size,
                        item.color.name,
                        item.quantity + 1
                      )
                    }
                    className="h-7 w-7 flex items-center justify-center border border-charcoal/20 hover:border-charcoal transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="card-retro sticky top-24 p-6">
            <h2 className="font-[family-name:var(--font-oswald)] text-lg uppercase tracking-[0.1em] text-charcoal">
              Resumen
            </h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal/50">Subtotal</span>
                <span className="font-[family-name:var(--font-oswald)] font-medium text-charcoal">
                  {formatPrice(getTotal())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/50">Envío</span>
                <span className="text-charcoal/30 text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider">
                  Calculado en checkout
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
            <Link
              href="/checkout"
              className="btn-retro mt-6 flex h-12 w-full items-center justify-center text-sm"
            >
              Finalizar compra
            </Link>
            <Link
              href="/catalogo"
              className="btn-retro-outline mt-3 flex h-12 w-full items-center justify-center text-sm"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
