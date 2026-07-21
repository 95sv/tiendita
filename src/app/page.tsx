"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { useEffect, useState, useCallback } from "react"
import type { Product } from "@/types"

export default function Home() {
  const [newProducts, setNewProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((all: Product[]) => {
        setNewProducts(all.slice(0, 4))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY)
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  const zoomScale = 1 + Math.min(scrollY / 4000, 0.05)
  const parallaxOffset = Math.round(scrollY * 0.15)

  return (
    <>
      {/* Hero */}
      <section className="relative h-[90vh] min-h-[640px] flex items-center justify-center overflow-hidden">

        {/* Background triptych */}
        <div
          className="absolute inset-0 z-0 flex transition-transform"
          style={{ transform: `scale(${zoomScale.toFixed(4)})` }}
        >
          <div className="flex-1 bg-cover bg-center opacity-20 blur-[2px] saturate-[1.15] sepia-[0.08]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1784639340419-d12a4024cb8c?q=80&w=440&auto=format&fit=crop')" }} />
          <div className="flex-1 bg-cover bg-center opacity-20 blur-[2px] saturate-[1.15] sepia-[0.08]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1784639333516-5adb16a4e3fe?q=80&w=440&auto=format&fit=crop')" }} />
          <div className="flex-1 bg-cover bg-center opacity-20 blur-[2px] saturate-[1.15] sepia-[0.08]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1784639440698-c5d9eebe427a?q=80&w=440&auto=format&fit=crop')" }} />
        </div>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 z-1"
          style={{
            background: "linear-gradient(180deg, rgba(44,44,44,0.55) 0%, rgba(161,51,57,0.35) 45%, rgba(20,20,20,0.88) 100%)",
            transform: `translateY(${parallaxOffset}px)`
          }}
        />

        <motion.div
          className="relative z-10 text-center px-4 max-w-3xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img src="/logo-cream.png" alt="La Loya — Ropa & Café, Bahía Blanca" className="h-[180px] w-auto block mx-auto drop-shadow-[0_2px_24px_rgba(0,0,0,0.4)]" />

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalogo" className="inline-flex items-center justify-center gap-2 px-10 py-4 text-sm font-[family-name:var(--font-libre)] uppercase tracking-[0.05em] bg-white/15 backdrop-blur-xl border border-white/30 text-cream rounded-sm transition-all hover:bg-white/25 hover:-translate-y-0.5">
              Ver catálogo
              <ArrowRight size={16} />
            </Link>
            <Link href="/contacto" className="inline-flex items-center justify-center gap-2 px-10 py-4 text-sm font-[family-name:var(--font-libre)] uppercase tracking-[0.05em] bg-black/15 backdrop-blur-xl border border-cream/35 text-cream rounded-sm transition-all hover:bg-black/25 hover:-translate-y-0.5">
              Contacto
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Nueva Colección */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.3em] text-rust">
              Lo último
            </span>
            <h2 className="font-[family-name:var(--font-libre)] text-3xl uppercase tracking-[0.05em] text-charcoal mt-1">
              Nueva Colección
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="font-[family-name:var(--font-libre)] text-xs uppercase tracking-[0.15em] text-charcoal/50 hover:text-rust transition-colors flex items-center gap-1"
          >
            Ver todo <ArrowRight size={12} />
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <p className="font-[family-name:var(--font-libre)] text-sm uppercase tracking-wider text-charcoal/30 animate-pulse">
              Cargando productos...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Banner */}
      <section className="bg-charcoal py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <img src="/logo-cream.png" alt="La Loya" className="h-[60px] w-auto mx-auto" />
          <p className="mt-2 font-[family-name:var(--font-libre)] text-sm uppercase tracking-[0.2em] text-cream/50 max-w-md mx-auto">
            Diseño que se siente. Calidad que se nota. Bahía Blanca, Argentina.
          </p>
          <div className="mt-3 inline-flex items-center gap-3 text-xs text-cream/30 font-[family-name:var(--font-libre)] uppercase tracking-[0.2em]">
            <span className="w-8 h-px bg-cream/20" />
            Lun — Sáb 7am a 8pm
            <span className="w-8 h-px bg-cream/20" />
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/hombres" className="group card-retro relative aspect-[4/3] flex items-end p-8 overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1784643842911-a38bb42b2415?q=80&w=435&auto=format&fit=crop')" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
            <div className="relative z-10">
              <span className="font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.3em] text-rust">
                Colección
              </span>
              <h3 className="font-[family-name:var(--font-cormorant)] text-3xl text-cream mt-1">
                Hombres
              </h3>
            </div>
          </Link>
          <Link href="/mujeres" className="group card-retro relative aspect-[4/3] flex items-end p-8 overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: "url('/laloya-colwo.jpg')" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
            <div className="relative z-10">
              <span className="font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.3em] text-rust">
                Colección
              </span>
              <h3 className="font-[family-name:var(--font-cormorant)] text-3xl text-cream mt-1">
                Mujeres
              </h3>
            </div>
          </Link>
        </div>
      </section>
    </>
  )
}
