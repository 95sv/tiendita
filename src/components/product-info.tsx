"use client"

import { useState } from "react"
import { formatPrice } from "@/lib/utils"
import type { Product, Color } from "@/types"
import { useCartStore } from "@/store/cart"
import { motion } from "framer-motion"
import { Check, Minus, Plus, ShoppingBag } from "lucide-react"

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<Color>(product.colors[0])
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const handleAddToCart = () => {
    if (!selectedSize) return
    addItem(product, selectedSize, selectedColor)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-oswald)] text-2xl uppercase tracking-[0.05em] text-charcoal">
          {product.name}
        </h1>
        <div className="mt-3 flex items-center gap-3">
          <span className="font-[family-name:var(--font-oswald)] text-xl font-semibold text-charcoal">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-charcoal/40 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>

      <div className="w-16 h-px bg-charcoal/20" />

      <p className="text-sm text-charcoal/60 leading-relaxed">
        {product.description}
      </p>

      <div>
        <label className="font-[family-name:var(--font-oswald)] text-xs uppercase tracking-[0.2em] text-charcoal/50">
          Color — {selectedColor.name}
        </label>
        <div className="mt-3 flex gap-2">
          {product.colors.map((color) => (
            <button
              key={color.name}
              onClick={() => setSelectedColor(color)}
              className={`h-8 w-8 rounded-full border-2 transition-all ${
                selectedColor.name === color.name
                  ? "border-rust scale-110 shadow-retro-sm"
                  : "border-charcoal/20 hover:border-charcoal/40"
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="font-[family-name:var(--font-oswald)] text-xs uppercase tracking-[0.2em] text-charcoal/50">
          Talle {selectedSize ? `— ${selectedSize}` : ""}
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`h-10 min-w-[40px] border-1.5 text-sm font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-all ${
                selectedSize === size
                  ? "bg-charcoal text-cream border-charcoal shadow-retro-sm"
                  : "bg-cream border-charcoal/20 hover:border-charcoal text-charcoal"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        {!selectedSize && (
          <p className="mt-2 text-xs text-rust font-[family-name:var(--font-oswald)] uppercase tracking-wider">
            Seleccioná un talle
          </p>
        )}
      </div>

      <div>
        <label className="font-[family-name:var(--font-oswald)] text-xs uppercase tracking-[0.2em] text-charcoal/50">
          Cantidad
        </label>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="flex h-10 w-10 items-center justify-center border border-charcoal/20 hover:border-charcoal text-charcoal transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center text-sm font-[family-name:var(--font-oswald)] font-medium">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="flex h-10 w-10 items-center justify-center border border-charcoal/20 hover:border-charcoal text-charcoal transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleAddToCart}
        disabled={!selectedSize || added}
        className={`flex h-12 w-full items-center justify-center gap-2 font-[family-name:var(--font-oswald)] text-sm uppercase tracking-[0.1em] transition-all ${
          added
            ? "bg-green-700 text-cream shadow-retro-sm"
            : selectedSize
            ? "btn-retro"
            : "bg-charcoal/10 text-charcoal/30 cursor-not-allowed shadow-none"
        }`}
      >
        {added ? (
          <>
            <Check size={16} />
            Agregado
          </>
        ) : (
          <>
            <ShoppingBag size={16} />
            Agregar al carrito
          </>
        )}
      </motion.button>
    </div>
  )
}
