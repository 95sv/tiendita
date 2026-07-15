"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { getNewProducts, getSaleProducts } from "@/lib/products"

export default function Home() {
  const newProducts = getNewProducts().slice(0, 4)
  const saleProducts = getSaleProducts().slice(0, 4)

  return (
    <>
      {/* Hero */}
      <section className="relative h-[90vh] flex items-center justify-center bg-cream overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <span className="font-[family-name:var(--font-pacifico)] text-[30vw] text-charcoal select-none">
            LL
          </span>
        </div>

        <motion.div
          className="relative z-10 text-center px-4 max-w-3xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="w-12 h-px bg-charcoal/20" />
            <span className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.4em] text-charcoal/40">
              Bahía Blanca
            </span>
            <span className="w-12 h-px bg-charcoal/20" />
          </div>

          <h1 className="font-[family-name:var(--font-pacifico)] text-6xl sm:text-8xl text-rust leading-none">
            La Loya
          </h1>

          <p className="mt-2 font-[family-name:var(--font-oswald)] text-sm uppercase tracking-[0.3em] text-charcoal/50">
            Ropa & Café
          </p>

          <div className="mt-8 divider-ornamental text-xs font-[family-name:var(--font-oswald)] uppercase tracking-[0.2em] text-charcoal/40">
            Diseño · Calidad · Esencia
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalogo" className="btn-retro inline-flex items-center justify-center gap-2 px-10 py-4 text-sm">
              Ver catálogo
              <ArrowRight size={16} />
            </Link>
            <Link href="/ofertas" className="btn-retro-outline inline-flex items-center justify-center gap-2 px-10 py-4 text-sm">
              Ofertas
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Nueva Colección */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.3em] text-rust">
              Lo último
            </span>
            <h2 className="font-[family-name:var(--font-oswald)] text-3xl uppercase tracking-[0.05em] text-charcoal mt-1">
              Nueva Colección
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="font-[family-name:var(--font-oswald)] text-xs uppercase tracking-[0.15em] text-charcoal/50 hover:text-rust transition-colors flex items-center gap-1"
          >
            Ver todo <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {newProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Banner */}
      <section className="bg-charcoal py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.4em] text-cream/30">
            ☕
          </span>
          <h2 className="font-[family-name:var(--font-pacifico)] text-4xl text-rust mt-4">
            Ropa & Café
          </h2>
          <p className="mt-4 font-[family-name:var(--font-oswald)] text-sm uppercase tracking-[0.2em] text-cream/50 max-w-md mx-auto">
            Diseño que se siente. Calidad que se nota. Bahía Blanca, Argentina.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 text-xs text-cream/30 font-[family-name:var(--font-oswald)] uppercase tracking-[0.2em]">
            <span className="w-8 h-px bg-cream/20" />
            Vie. 19 — 17 hs
            <span className="w-8 h-px bg-cream/20" />
          </div>
        </div>
      </section>

      {/* Ofertas */}
      {saleProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.3em] text-rust">
                Descuentos
              </span>
              <h2 className="font-[family-name:var(--font-oswald)] text-3xl uppercase tracking-[0.05em] text-charcoal mt-1">
                Ofertas
              </h2>
            </div>
            <Link
              href="/ofertas"
              className="font-[family-name:var(--font-oswald)] text-xs uppercase tracking-[0.15em] text-charcoal/50 hover:text-rust transition-colors flex items-center gap-1"
            >
              Ver ofertas <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {saleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Categorías */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/hombres" className="group card-retro relative aspect-[4/3] flex items-end p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
            <div className="relative z-10">
              <span className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.3em] text-rust">
                Colección
              </span>
              <h3 className="font-[family-name:var(--font-pacifico)] text-3xl text-cream mt-1">
                Hombres
              </h3>
            </div>
          </Link>
          <Link href="/mujeres" className="group card-retro relative aspect-[4/3] flex items-end p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
            <div className="relative z-10">
              <span className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.3em] text-rust">
                Colección
              </span>
              <h3 className="font-[family-name:var(--font-pacifico)] text-3xl text-cream mt-1">
                Mujeres
              </h3>
            </div>
          </Link>
        </div>
      </section>
    </>
  )
}
