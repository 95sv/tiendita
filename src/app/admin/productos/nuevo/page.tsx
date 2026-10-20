"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAdminStore } from "@/store/admin"
import { COLOR_PALETTE, UNIQUE_COLOR } from "@/lib/colors"
import { PriceFields, priceError, pricesFromFields } from "@/components/admin/price-fields"
import { ArrowLeft, Upload, X, Plus } from "lucide-react"
import Link from "next/link"

export default function NuevoProductoPage() {
  const router = useRouter()
  const addProduct = useAdminStore((s) => s.addProduct)

  const [form, setForm] = useState({
    name: "",
    description: "",
    listPrice: "",
    salePrice: "",
    category: "hombres" as "hombres" | "mujeres" | "ofertas",
    subcategory: "",
    active: true,
  })

  const [images, setImages] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState("")
  const [sizes, setSizes] = useState<string[]>([])
  const [sizeInput, setSizeInput] = useState("")
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([])
  const [stockMatrix, setStockMatrix] = useState<Record<string, number>>({})

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()])
      setImageUrl("")
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleAddSize = () => {
    if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) {
      const newSize = sizeInput.trim()
      setSizes([...sizes, newSize])
      setSizeInput("")
      setStockMatrix((prev) => {
        const next = { ...prev }
        for (const c of colors) {
          const key = `${newSize}__${c.name}`
          if (!(key in next)) next[key] = 0
        }
        return next
      })
    }
  }

  const handleRemoveSize = (size: string) => {
    setSizes(sizes.filter((s) => s !== size))
    setStockMatrix((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(next)) {
        if (key.startsWith(`${size}__`)) delete next[key]
      }
      return next
    })
  }

  const handleToggleColor = (color: { name: string; hex: string }) => {
    const exists = colors.find((c) => c.name === color.name)
    if (exists) {
      setColors(colors.filter((c) => c.name !== color.name))
      setStockMatrix((prev) => {
        const next = { ...prev }
        for (const key of Object.keys(next)) {
          if (key.endsWith(`__${color.name}`)) delete next[key]
        }
        return next
      })
    } else {
      setColors([...colors, color])
      setStockMatrix((prev) => {
        const next = { ...prev }
        for (const s of sizes) {
          const key = `${s}__${color.name}`
          if (!(key in next)) next[key] = 0
        }
        return next
      })
    }
  }

  const setStock = (size: string, color: string, val: number) => {
    setStockMatrix((prev) => ({ ...prev, [`${size}__${color}`]: val }))
  }

  const totalStock = Object.values(stockMatrix).reduce((a, b) => a + b, 0)

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name) {
      alert("Completá el nombre")
      return
    }

    const pricingError = priceError(form.listPrice, form.salePrice)
    if (pricingError) {
      alert(pricingError)
      return
    }
    const pricing = pricesFromFields(form.listPrice, form.salePrice)

    setSubmitting(true)
    try {
      const safeColors = colors.length > 0 ? colors : [UNIQUE_COLOR]
      const safeSizes = sizes.length > 0 ? sizes : ["Único"]

      const variants: { id: string; size: string; color: string; stock: number }[] = []
      for (const s of safeSizes) {
        for (const c of safeColors) {
          variants.push({
            id: `${s}__${c.name}`,
            size: s,
            color: c.name,
            stock: stockMatrix[`${s}__${c.name}`] ?? 0,
          })
        }
      }

      const { warnings } = await addProduct({
        id: Date.now().toString(),
        name: form.name,
        description: form.description,
        price: pricing.price,
        originalPrice: pricing.originalPrice,
        images,
        category: form.category,
        subcategory: form.subcategory || undefined,
        sizes: safeSizes,
        colors: safeColors,
        variants,
        slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        isNew: true,
        discount: pricing.discount,
        stock: totalStock,
        active: form.active,
      })
      if (warnings.length > 0) {
        alert(`El producto se creó, pero ${warnings.join(" y ")}.`)
      }
      router.push("/admin/productos")
    } catch (err: any) {
      alert("Error: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <Link
          href="/admin/productos"
          className="inline-flex items-center gap-1 text-xs text-charcoal/40 hover:text-charcoal font-[family-name:var(--font-libre)] uppercase tracking-wider mb-4 transition-colors"
        >
          <ArrowLeft size={12} />
          Volver a productos
        </Link>
        <h1 className="font-[family-name:var(--font-libre)] text-3xl uppercase tracking-[0.05em] text-charcoal">
          Nuevo producto
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="card-retro p-6 space-y-4">
          <h2 className="font-[family-name:var(--font-libre)] text-sm uppercase tracking-[0.15em] text-charcoal">
            Información básica
          </h2>

          <div>
            <label className="font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
              Nombre *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-retro w-full px-4 py-3 text-sm mt-2"
              placeholder="Ej: Remera Básica Premium"
              required
            />
          </div>

          <div>
            <label className="font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-retro w-full px-4 py-3 text-sm mt-2 h-24 resize-none"
              placeholder="Descripción del producto..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
                Categoría *
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as typeof form.category })
                }
                className="input-retro w-full px-4 py-3 text-sm mt-2"
              >
                <option value="hombres">Hombres</option>
                <option value="mujeres">Mujeres</option>
                <option value="ofertas">Ofertas</option>
              </select>
            </div>
            <div>
              <label className="font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
                Subcategoría
              </label>
              <input
                type="text"
                value={form.subcategory}
                onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                className="input-retro w-full px-4 py-3 text-sm mt-2"
                placeholder="Ej: remeras"
              />
            </div>
          </div>
        </div>

        {/* Imágenes */}
        <div className="card-retro p-6 space-y-4">
          <h2 className="font-[family-name:var(--font-libre)] text-sm uppercase tracking-[0.15em] text-charcoal">
            Imágenes *
          </h2>
          <p className="text-xs text-charcoal/40">
            Pegá URLs de imágenes (Unsplash, Cloudinary, etc.)
          </p>

          <div className="flex gap-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input-retro flex-1 px-4 py-3 text-sm"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="btn-retro px-4 py-3 text-sm"
            >
              <Upload size={16} />
            </button>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square bg-cream-dark rounded overflow-hidden">
                  <img
                    src={img}
                    alt={`Imagen ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1 right-1 bg-charcoal/80 text-cream rounded-full p-1 hover:bg-rust transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Precio */}
        <div className="card-retro p-6 space-y-4">
          <h2 className="font-[family-name:var(--font-libre)] text-sm uppercase tracking-[0.15em] text-charcoal">
            Precio y descuento
          </h2>

          <PriceFields
            listPrice={form.listPrice}
            salePrice={form.salePrice}
            onChange={(next) => setForm({ ...form, ...next })}
          />
        </div>

        {/* Talles */}
        <div className="card-retro p-6 space-y-4">
          <h2 className="font-[family-name:var(--font-libre)] text-sm uppercase tracking-[0.15em] text-charcoal">
            Talles *
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSize())}
              className="input-retro flex-1 px-4 py-3 text-sm"
              placeholder="Ej: S, M, L, XL"
            />
            <button
              type="button"
              onClick={handleAddSize}
              className="btn-retro px-4 py-3 text-sm"
            >
              <Plus size={16} />
            </button>
          </div>

          {sizes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <span
                  key={size}
                  className="inline-flex items-center gap-1 bg-charcoal text-cream px-3 py-1 text-xs font-[family-name:var(--font-libre)] uppercase tracking-wider"
                >
                  {size}
                  <button
                    type="button"
                    onClick={() => handleRemoveSize(size)}
                    className="hover:text-rust transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Colores */}
        <div className="card-retro p-6 space-y-4">
          <h2 className="font-[family-name:var(--font-libre)] text-sm uppercase tracking-[0.15em] text-charcoal">
            Colores
          </h2>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {COLOR_PALETTE.map((color) => {
              const selected = colors.find((c) => c.name === color.name)
              return (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => handleToggleColor(color)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-[family-name:var(--font-libre)] uppercase tracking-wider border transition-all ${
                    selected
                      ? "border-rust bg-rust/10 text-charcoal"
                      : "border-charcoal/20 text-charcoal/50 hover:border-charcoal/40"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-charcoal/20 flex-shrink-0"
                    style={{ backgroundColor: color.hex }}
                  />
                  {color.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Stock por talle y color */}
        <div className="card-retro p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-libre)] text-sm uppercase tracking-[0.15em] text-charcoal">
              Stock por talle y color
            </h2>
            <span className="font-[family-name:var(--font-libre)] text-xs uppercase tracking-wider text-charcoal/50">
              Total: {totalStock}
            </span>
          </div>

          {sizes.length === 0 || colors.length === 0 ? (
            <p className="text-xs text-charcoal/40">
              Agregá talles y colores para gestionar el stock por variante.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-charcoal/10">
                    <th className="text-left p-2 font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
                      Talle
                    </th>
                    {colors.map((c) => (
                      <th key={c.name} className="text-center p-2 font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
                        <span className="inline-flex items-center gap-1">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: c.hex }}
                          />
                          {c.name}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((size) => (
                    <tr key={size} className="border-b border-charcoal/5">
                      <td className="p-2 font-[family-name:var(--font-libre)] text-xs uppercase tracking-wider text-charcoal">
                        {size}
                      </td>
                      {colors.map((c) => {
                        const key = `${size}__${c.name}`
                        return (
                          <td key={c.name} className="p-2 text-center">
                            <input
                              type="number"
                              min="0"
                              value={stockMatrix[key] ?? 0}
                              onChange={(e) =>
                                setStock(size, c.name, Math.max(0, parseInt(e.target.value) || 0))
                              }
                              className="input-retro w-16 px-2 py-1 text-center text-xs"
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button type="submit" disabled={submitting} className="btn-retro px-8 py-3 text-sm disabled:opacity-50">
            {submitting ? "Creando..." : "Crear producto"}
          </button>
          <Link
            href="/admin/productos"
            className="btn-retro-outline px-8 py-3 text-sm"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
