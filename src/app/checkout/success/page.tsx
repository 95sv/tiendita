"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react"
import { useCartStore } from "@/store/cart"

function SuccessContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "sent" | "error">("loading")
  const clearCart = useCartStore((s) => s.clearCart)

  useEffect(() => {
    const cartItems = useCartStore.getState().items
    const total = useCartStore.getState().getTotal()

    if (cartItems.length > 0) {
      fetch("/api/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Cliente",
          email: "cliente@example.com",
          items: cartItems.map((i) => ({
            name: i.product.name,
            size: i.size,
            quantity: i.quantity,
            price: i.product.price,
          })),
          total,
          address: "A coordinar",
          city: "Bahia Blanca",
          province: "Buenos Aires",
        }),
      })
        .then(() => setStatus("sent"))
        .catch(() => setStatus("error"))
        .finally(() => clearCart())
    } else {
      setStatus("sent")
    }
  }, [clearCart])

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="card-retro p-10">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle size={32} className="text-green-600" />
          </div>
        </div>

        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl text-rust">
          Compra exitosa!
        </h1>

        <p className="mt-4 font-[family-name:var(--font-libre)] text-sm text-charcoal/60 leading-relaxed">
          Tu pedido fue procesado correctamente. Te enviamos un email con los detalles de tu compra.
        </p>

        {status === "loading" && (
          <p className="mt-4 font-[family-name:var(--font-libre)] text-xs text-charcoal/40 animate-pulse flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin" />
            Enviando confirmacion por email...
          </p>
        )}

        {status === "sent" && (
          <p className="mt-4 font-[family-name:var(--font-libre)] text-xs text-green-600">
            Email de confirmacion enviado!
          </p>
        )}

        {status === "error" && (
          <p className="mt-4 font-[family-name:var(--font-libre)] text-xs text-charcoal/40">
            No pudimos enviar el email, pero tu compra se registro correctamente.
          </p>
        )}

        <div className="mt-8 space-y-3">
          <Link
            href="/catalogo"
            className="btn-retro inline-flex items-center justify-center gap-2 px-8 py-3 text-sm w-full"
          >
            Seguir comprando
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/"
            className="font-[family-name:var(--font-libre)] text-xs uppercase tracking-[0.15em] text-charcoal/40 hover:text-charcoal transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <div className="card-retro p-10">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle size={32} className="text-green-600" />
              </div>
            </div>
            <p className="font-[family-name:var(--font-libre)] text-sm text-charcoal/40 animate-pulse">
              Cargando...
            </p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
