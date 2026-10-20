"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAdminStore } from "@/store/admin"
import { hexForColor } from "@/lib/colors"
import { sortSizes } from "@/lib/utils"
import { PriceFields, priceError, pricesFromFields } from "@/components/admin/price-fields"
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"

export default function EditProductoPage() {
  const router = useRouter()
  const params = useParams()
  const { products, loading, loadProducts, updateProduct } = useAdminStore()
  const product = products.find((p) => p.id === params.id)

  useEffect(() => {
    if (useAdminStore.getState().products.length === 0) loadProducts()
  }, [loadProducts])

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
  const [stockMatrix, setStockMatrix] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description,
        listPrice: (product.originalPrice ?? product.price).toString(),
        salePrice: product.originalPrice ? product.price.toString() : "",
        category: product.category as "hombres" | "mujeres" | "ofertas",
        subcategory: product.subcategory || "",
        active: product.active,
      })
      setImages(product.images)

      const matrix: Record<string, number> = {}
      for (const v of product.variants || []) {
        matrix[`${v.size}__${v.color}`] = v.stock
      }
      setStockMatrix(matrix)
    }
  }, [product])

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-charcoal/40">
          {loading ? "Cargando producto..." : "Producto no encontrado"}
        </p>
        <Link href="/admin/productos" className="text-rust text-sm mt-4 inline-block">
          Volver a productos
        </Link>
      </div>
    )
  }

  const variants = product.variants || []
  const sizes = sortSizes([...new Set(variants.map((v) => v.size))])
  const colors = [...new Set(variants.map((v) => v.color))].map((name) => ({
    name,
    hex: hexForColor(name),
  }))

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()])
      setImageUrl("")
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const setStock = (size: string, color: string, val: number) => {
    setStockMatrix((prev) => ({ ...prev, [`${size}__${color}`]: val }))
  }

  const totalStock = Object.values(stockMatrix).reduce((a, b) => a + b, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || images.length === 0) {
      alert("Completá todos los campos obligatorios")
      return
    }

    const pricingError = priceError(form.listPrice, form.salePrice)
    if (pricingError) {
      alert(pricingError)
      return
    }
    const pricing = pricesFromFields(form.listPrice, form.salePrice)

    const updatedVariants = variants.map((v) => ({
      ...v,
      stock: stockMatrix[`${v.size}__${v.color}`] ?? v.stock,
    }))

    setSaving(true)
    try {
      await updateProduct(product.id, {
        name: form.name,
        description: form.description,
        price: pricing.price,
        originalPrice: pricing.originalPrice,
        images,
        category: form.category,
        subcategory: form.subcategory || undefined,
        variants: updatedVariants,
        discount: pricing.discount,
        stock: totalStock,
        active: form.active,
      })
      router.push("/admin/productos")
    } catch (err: any) {
      alert("No se pudieron guardar los cambios: " + err.message)
    } finally {
      setSaving(false)
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
          Editar producto
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
              />
            </div>
          </div>
        </div>

        {/* Imágenes */}
        <div className="card-retro p-6 space-y-4">
          <h2 className="font-[family-name:var(--font-libre)] text-sm uppercase tracking-[0.15em] text-charcoal">
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

        {/* Precios */}
        <div className="card-retro p-6 space-y-4">
          <h2 className="font-[family-name:var(--font-libre)] text-sm uppercase tracking-[0.15em] text-charcoal">
            Precio y descuento
          </h2>

          <PriceFields
            listPrice={form.listPrice}
            salePrice={form.salePrice}
            onChange={(next) => setForm({ ...form, ...next })}
          />

          <div className="flex items-center gap-3">
            <label className="font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
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
            <span className="font-[family-name:var(--font-libre)] text-xs uppercase tracking-wider text-charcoal/60">
              {form.active ? "Activo" : "Inactivo"}
            </span>
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

          <p className="text-xs text-charcoal/40">
            Los talles y colores se definen al crear el producto.
          </p>

          {variants.length === 0 ? (
            <p className="text-xs text-charcoal/40">
              Este producto no tiene variantes cargadas.
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
                        if (!(key in stockMatrix)) {
                          return (
                            <td key={c.name} className="p-2 text-center text-xs text-charcoal/20">
                              —
                            </td>
                          )
                        }
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
          <button
            type="submit"
            disabled={saving}
            className="btn-retro px-8 py-3 text-sm disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
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
