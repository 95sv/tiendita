"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAdminStore } from "@/store/admin"
import { ArrowLeft, Upload, X, Plus } from "lucide-react"
import Link from "next/link"

export default function EditProductoPage() {
  const router = useRouter()
  const params = useParams()
  const { products, updateProduct } = useAdminStore()
  const product = products.find((p) => p.id === params.id)

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "hombres" as "hombres" | "mujeres" | "ofertas",
    subcategory: "",
    stock: "",
    active: true,
  })

  const [images, setImages] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState("")
  const [sizes, setSizes] = useState<string[]>([])
  const [sizeInput, setSizeInput] = useState("")
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([])
  const [colorName, setColorName] = useState("")
  const [colorHex, setColorHex] = useState("#000000")

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || "",
        category: product.category as "hombres" | "mujeres" | "ofertas",
        subcategory: product.subcategory || "",
        stock: product.stock.toString(),
        active: product.active,
      })
      setImages(product.images)
      setSizes(product.sizes)
      setColors(product.colors)
    }
  }, [product])

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-charcoal/40">Producto no encontrado</p>
        <Link href="/admin/productos" className="text-rust text-sm mt-4 inline-block">
          Volver a productos
        </Link>
      </div>
    )
  }

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
      setSizes([...sizes, sizeInput.trim()])
      setSizeInput("")
    }
  }

  const handleRemoveSize = (size: string) => {
    setSizes(sizes.filter((s) => s !== size))
  }

  const handleAddColor = () => {
    if (colorName.trim()) {
      setColors([...colors, { name: colorName.trim(), hex: colorHex }])
      setColorName("")
      setColorHex("#000000")
    }
  }

  const handleRemoveColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || !form.price || images.length === 0 || sizes.length === 0) {
      alert("Completá todos los campos obligatorios")
      return
    }

    const slug = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")

    updateProduct(product.id, {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      images,
      category: form.category,
      subcategory: form.subcategory || undefined,
      sizes,
      colors: colors.length > 0 ? colors : [{ name: "Único", hex: "#000000" }],
      slug,
      discount: form.originalPrice
        ? Math.round(
            ((Number(form.originalPrice) - Number(form.price)) /
              Number(form.originalPrice)) *
              100
          )
        : undefined,
      stock: Number(form.stock),
      active: form.active,
    })

    router.push("/admin/productos")
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <Link
          href="/admin/productos"
          className="inline-flex items-center gap-1 text-xs text-charcoal/40 hover:text-charcoal font-[family-name:var(--font-oswald)] uppercase tracking-wider mb-4 transition-colors"
        >
          <ArrowLeft size={12} />
          Volver a productos
        </Link>
        <h1 className="font-[family-name:var(--font-oswald)] text-3xl uppercase tracking-[0.05em] text-charcoal">
          Editar producto
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="card-retro p-6 space-y-4">
          <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-[0.15em] text-charcoal">
            Información básica
          </h2>

          <div>
            <label className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
              Nombre *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-retro w-full px-4 py-3 text-sm mt-2"
              required
            />
          </div>

          <div>
            <label className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-retro w-full px-4 py-3 text-sm mt-2 h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
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
              <label className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
                Subcategoría
              </label>
              <input
                type="text"
                value={form.subcategory}
                onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                className="input-retro w-full px-4 py-3 text-sm mt-2"
              />
            </div>
          </div>
        </div>

        {/* Imágenes */}
        <div className="card-retro p-6 space-y-4">
          <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-[0.15em] text-charcoal">
            Imágenes *
          </h2>

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
                  <img src={img} alt={`Imagen ${i + 1}`} className="w-full h-full object-cover" />
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

        {/* Precios y stock */}
        <div className="card-retro p-6 space-y-4">
          <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-[0.15em] text-charcoal">
            Precios y stock
          </h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
                Precio ($) *
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input-retro w-full px-4 py-3 text-sm mt-2"
                min="0"
                required
              />
            </div>
            <div>
              <label className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
                Precio original ($)
              </label>
              <input
                type="number"
                value={form.originalPrice}
                onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                className="input-retro w-full px-4 py-3 text-sm mt-2"
                min="0"
              />
            </div>
            <div>
              <label className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
                Stock *
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="input-retro w-full px-4 py-3 text-sm mt-2"
                min="0"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
              Estado
            </label>
            <button
              type="button"
              onClick={() => setForm({ ...form, active: !form.active })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                form.active ? "bg-rust" : "bg-charcoal/20"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-cream rounded-full transition-transform ${
                  form.active ? "left-7" : "left-1"
                }`}
              />
            </button>
            <span className="font-[family-name:var(--font-oswald)] text-xs uppercase tracking-wider text-charcoal/60">
              {form.active ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>

        {/* Talles */}
        <div className="card-retro p-6 space-y-4">
          <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-[0.15em] text-charcoal">
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
                  className="inline-flex items-center gap-1 bg-charcoal text-cream px-3 py-1 text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider"
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
          <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-[0.15em] text-charcoal">
            Colores
          </h2>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
                Nombre
              </label>
              <input
                type="text"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                className="input-retro w-full px-4 py-3 text-sm mt-2"
                placeholder="Ej: Negro"
              />
            </div>
            <div>
              <label className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
                Color
              </label>
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="h-[46px] w-12 mt-2 cursor-pointer border border-charcoal/20"
              />
            </div>
            <button
              type="button"
              onClick={handleAddColor}
              className="btn-retro px-4 py-3 text-sm"
            >
              <Plus size={16} />
            </button>
          </div>

          {colors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {colors.map((color, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 bg-charcoal text-cream px-3 py-1 text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider"
                >
                  <span
                    className="w-3 h-3 rounded-full border border-cream/30"
                    style={{ backgroundColor: color.hex }}
                  />
                  {color.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(i)}
                    className="hover:text-rust transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button type="submit" className="btn-retro px-8 py-3 text-sm">
            Guardar cambios
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
