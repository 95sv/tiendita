"use client"

import { ProductCard } from "@/components/product-card"
import { products } from "@/lib/products"

export default function CatalogoPage() {
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
          {products.length} productos
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
