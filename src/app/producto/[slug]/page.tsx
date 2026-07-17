"use client"

import { useParams } from "next/navigation"
import Image from "next/image"
import { getProductBySlug } from "@/lib/products"
import { ProductInfo } from "@/components/product-info"
import { ImageZoom } from "@/components/image-zoom"
import { notFound } from "next/navigation"
import { useState } from "react"

export default function ProductPage() {
  const params = useParams()
  const product = getProductBySlug(params.slug as string)
  const [selectedImage, setSelectedImage] = useState(0)

  if (!product) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="aspect-[3/4] card-retro overflow-hidden bg-cream-dark">
            <ImageZoom
              src={product.images[selectedImage]}
              alt={product.name}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
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
                    alt={`${product.name} ${i + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <ProductInfo product={product} />
        </div>
      </div>
    </div>
  )
}
