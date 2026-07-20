"use client"

import { useEffect, useState } from "react"
import { ProductCard } from "@/components/product-card"
import { getAllProducts } from "@/lib/medusa-store"
import type { Product } from "@/types"

const categories = [
  { key: "all", label: "Todos" },
  { key: "remeras", label: "Remeras" },
  { key: "pantalones", label: "Pantalones" },
  { key: "camperas", label: "Camperas" },
  { key: "accesorios", label: "Accesorios" },
  { key: "vestidos", label: "Vestidos" },
]

export default function CatalogoPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")

  useEffect(() => {
    getAllProducts().then((p) => {
      setProducts(p)
      setLoading(false)
    })
  }, [])

  const filtered = activeCategory === "all"
    ? products
    : products.filter((p) => p.collectionTitle?.toLowerCase() === activeCategory)

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <span className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.3em] text-rust">
          Catálogo
        </span>
        <h1 className="font-[family-name:var(--font-oswald)] text-4xl uppercase tracking-[0.05em] text-charcoal mt-1">
          Todos los productos
        </h1>
        <p className="mt-2 font-[family-name:var(--font-oswald)] text-sm text-charcoal/40 uppercase tracking-[0.1em]">
          {loading ? "Cargando..." : `${filtered.length} productos`}
        </p>
      </div>

      {!loading && (
        <div className="flex flex-wrap gap-2 mb-8 border-b border-charcoal/10 pb-4">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`font-[family-name:var(--font-oswald)] text-xs uppercase tracking-[0.15em] px-4 py-2 transition-all ${
                activeCategory === cat.key
                  ? "bg-charcoal text-cream"
                  : "bg-cream-dark text-charcoal/50 hover:text-charcoal hover:bg-charcoal/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider text-charcoal/30 animate-pulse">
            Cargando productos...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider text-charcoal/30">
            No hay productos en esta categoría
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
