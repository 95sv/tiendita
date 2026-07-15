"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/types"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link href={`/producto/${product.slug}`} className="group block">
        <div className="card-retro relative aspect-[3/4] overflow-hidden bg-cream-dark">
          {product.isNew && (
            <span className="badge-retro absolute left-3 top-3 z-10 text-rust border-rust bg-cream">
              Nuevo
            </span>
          )}
          {product.discount && (
            <span className="badge-retro absolute left-3 top-3 z-10 text-rust border-rust bg-cream">
              -{product.discount}%
            </span>
          )}
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="mt-3 space-y-1">
          <h3 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-[0.05em] text-charcoal group-hover:text-rust transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-[family-name:var(--font-oswald)] text-sm font-semibold text-charcoal">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-charcoal/40 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
