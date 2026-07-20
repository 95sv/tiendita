"use client"

import { useEffect, useState } from "react"
import { ProductCard } from "@/components/product-card"
import { getAllProducts } from "@/lib/medusa-store"
import type { Product } from "@/types"

export default function HombresPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllProducts().then((all) => {
      setProducts(all.filter((p) => p.category === "hombres"))
      setLoading(false)
    })
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <span className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.3em] text-rust">
          Colección
        </span>
        <h1 className="font-[family-name:var(--font-oswald)] text-4xl uppercase tracking-[0.05em] text-charcoal mt-1">
          Hombres
        </h1>
        <p className="mt-2 font-[family-name:var(--font-oswald)] text-sm text-charcoal/40 uppercase tracking-[0.1em]">
          {loading ? "Cargando..." : `${products.length} productos`}
        </p>
      </div>
      {loading ? (
        <div className="text-center py-12">
          <p className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider text-charcoal/30 animate-pulse">
            Cargando productos...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
