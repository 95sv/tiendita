"use client"

import { useParams } from "next/navigation"
import Image from "next/image"
import { ProductInfo } from "@/components/product-info"
import { ImageZoom } from "@/components/image-zoom"
import { notFound } from "next/navigation"
import { useState, useEffect } from "react"
import type { Product } from "@/types"

export default function ProductPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((all: Product[]) => {
        const found = all.find((p) => p.slug === params.slug)
        setProduct(found || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.slug])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center py-20">
          <p className="font-[family-name:var(--font-libre)] text-sm uppercase tracking-wider text-charcoal/30 animate-pulse">
            Cargando producto...
          </p>
        </div>
      </div>
    )
  }

  if (!product) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          {product!.images.length > 0 ? (
            <>
              <div className="aspect-[3/4] card-retro overflow-hidden bg-cream-dark">
                <ImageZoom
                  src={product!.images[selectedImage]}
                  alt={product!.name}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
              {product!.images.length > 1 && (
                <div className="flex gap-2">
                  {product!.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative aspect-square w-20 overflow-hidden border-2 transition-all ${
                        selectedImage === i
                          ? "border-rust"
                          : "border-charcoal/10 hover:border-charcoal/30"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product!.name} ${i + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-[3/4] card-retro overflow-hidden bg-cream-dark flex items-center justify-center">
              <span className="font-[family-name:var(--font-cormorant)] text-4xl text-charcoal/20">LL</span>
            </div>
          )}
        </div>
        <div>
          <ProductInfo product={product!} />
        </div>
      </div>
    </div>
  )
}
