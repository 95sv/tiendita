"use client"

import { useEffect, useState } from "react"
import {
  fetchPromotions,
  createCoupon,
  updateCoupon,
  setPromotionActive,
  deletePromotion,
  couponProductIds,
  isStoreCoupon,
  type CouponInput,
  type MedusaPromotion,
} from "@/lib/medusa"
import { useAdminStore } from "@/store/admin"
import { couponLabel } from "@/lib/coupon"
import { formatPrice } from "@/lib/utils"
import { csvDate, exportToCSV } from "@/lib/export-csv"
import { EmptyState } from "@/components/admin/empty-state"
import { Tag, Plus, Trash2, X, Loader2, Download, Pencil, Search } from "lucide-react"

const labelClass =
  "font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50"

function discountText(promo: MedusaPromotion): string {
  const method = promo.application_method
  return method ? couponLabel({ type: method.type, value: Number(method.value) }) : "—"
}

function CouponForm({
  promo,
  onSaved,
  onClose,
}: {
  promo: MedusaPromotion | null
  onSaved: (p: MedusaPromotion) => void
  onClose: () => void
}) {
  const { products, loadProducts } = useAdminStore()
  const initialIds = promo ? couponProductIds(promo) : null

  const [code, setCode] = useState(promo?.code || "")
  const [type, setType] = useState<"percentage" | "fixed">(
    promo?.application_method?.type || "percentage"
  )
  const [value, setValue] = useState(promo ? String(promo.application_method?.value ?? "") : "")
  const [scope, setScope] = useState<"all" | "selected">(initialIds ? "selected" : "all")
  const [selected, setSelected] = useState<string[]>(initialIds || [])
  const [active, setActive] = useState(promo ? promo.status === "active" : true)
  const [search, setSearch] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (useAdminStore.getState().products.length === 0) loadProducts()
  }, [loadProducts])

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase())
  )

  const toggleProduct = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number(value)
    const cleanCode = code.trim().toUpperCase()

    if (!promo && !/^[A-Z0-9_-]{3,30}$/.test(cleanCode)) {
      setError("El código debe tener entre 3 y 30 letras, números o guiones, sin espacios")
      return
    }
    if (type === "percentage" && !(amount >= 1 && amount <= 99)) {
      setError("El porcentaje tiene que estar entre 1 y 99")
      return
    }
    if (type === "fixed" && !(amount > 0)) {
      setError("El monto tiene que ser mayor a 0")
      return
    }
    if (scope === "selected" && selected.length === 0) {
      setError("Elegí al menos un producto")
      return
    }

    const input: CouponInput = {
      type,
      value: amount,
      productIds: scope === "selected" ? selected : null,
      active,
    }

    setSaving(true)
    setError("")
    try {
      const saved = promo ? await updateCoupon(promo, input) : await createCoupon(cleanCode, input)
      onSaved(saved)
      onClose()
    } catch (err: any) {
      setError(err.message || "No se pudo guardar el cupón")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-cream card-retro max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-[family-name:var(--font-libre)] text-xl uppercase tracking-[0.05em] text-charcoal">
            {promo ? `Editar cupón ${promo.code}` : "Nuevo cupón"}
          </h2>
          <button onClick={onClose} className="text-charcoal/40 hover:text-charcoal transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Código</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ej: VERANO20"
              className="input-retro w-full px-4 py-3 text-sm mt-2 uppercase disabled:opacity-60"
              disabled={!!promo}
              required
            />
            {promo && (
              <p className="mt-1 text-[10px] text-charcoal/40">El código no se puede cambiar.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tipo de descuento</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "percentage" | "fixed")}
                className="input-retro w-full px-4 py-3 text-sm mt-2"
              >
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto fijo por unidad ($)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{type === "percentage" ? "Porcentaje" : "Monto ($)"}</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === "percentage" ? "20" : "1000"}
                className="input-retro w-full px-4 py-3 text-sm mt-2"
                min="1"
                max={type === "percentage" ? "99" : undefined}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Aplica a</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["all", "selected"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setScope(option)}
                  className={`px-3 py-2 text-xs font-[family-name:var(--font-libre)] uppercase tracking-wider border transition-all ${
                    scope === option
                      ? "border-rust bg-rust/10 text-charcoal"
                      : "border-charcoal/20 text-charcoal/50 hover:border-charcoal/40"
                  }`}
                >
                  {option === "all" ? "Todos los productos" : "Productos elegidos"}
                </button>
              ))}
            </div>

            {scope === "selected" && (
              <div className="mt-3 border border-charcoal/15">
                <div className="flex items-center gap-2 border-b border-charcoal/10 px-3 py-2">
                  <Search size={14} className="text-charcoal/30" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar producto"
                    className="flex-1 bg-transparent text-xs outline-none"
                  />
                  <span className="text-[10px] font-[family-name:var(--font-libre)] uppercase tracking-wider text-charcoal/40">
                    {selected.length} elegidos
                  </span>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {products.length === 0 ? (
                    <p className="p-3 text-xs text-charcoal/40">Cargando productos...</p>
                  ) : filtered.length === 0 ? (
                    <p className="p-3 text-xs text-charcoal/40">No hay productos con ese nombre.</p>
                  ) : (
                    filtered.map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center gap-3 px-3 py-2 text-xs cursor-pointer hover:bg-charcoal/[0.03]"
                      >
                        <input
                          type="checkbox"
                          checked={selected.includes(p.id)}
                          onChange={() => toggleProduct(p.id)}
                          className="accent-rust"
                        />
                        <span className="flex-1 font-[family-name:var(--font-libre)] uppercase tracking-wider text-charcoal">
                          {p.name}
                        </span>
                        <span className="text-charcoal/40">{formatPrice(p.price)}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className={labelClass}>Estado</label>
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`relative w-12 h-6 rounded-full transition-colors ${active ? "bg-rust" : "bg-charcoal/20"}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-cream rounded-full transition-transform ${
                  active ? "left-7" : "left-1"
                }`}
              />
            </button>
            <span className="font-[family-name:var(--font-libre)] text-xs uppercase tracking-wider text-charcoal/60">
              {active ? "Activo: se puede usar en la tienda" : "Inactivo"}
            </span>
          </div>

          {error && (
            <p className="text-xs text-red-600 font-[family-name:var(--font-libre)] uppercase tracking-wider">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="btn-retro w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Guardando...
              </>
            ) : promo ? (
              "Guardar cambios"
            ) : (
              "Crear cupón"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function PromocionesPage() {
  const { products, loadProducts } = useAdminStore()
  const [promotions, setPromotions] = useState<MedusaPromotion[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [editing, setEditing] = useState<MedusaPromotion | "new" | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    fetchPromotions()
      .then(setPromotions)
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoading(false))
    if (useAdminStore.getState().products.length === 0) loadProducts()
  }, [loadProducts])

  const productName = (id: string) => products.find((p) => p.id === id)?.name || id

  const appliesTo = (promo: MedusaPromotion): string => {
    if (!isStoreCoupon(promo)) return "Formato anterior: no se puede usar en la tienda"
    const ids = couponProductIds(promo)
    return ids ? ids.map(productName).join(", ") : "Todos los productos"
  }

  const replace = (saved: MedusaPromotion) =>
    setPromotions((prev) =>
      prev.some((p) => p.id === saved.id) ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev]
    )

  const handleToggle = async (promo: MedusaPromotion) => {
    setBusyId(promo.id)
    try {
      replace(await setPromotionActive(promo.id, promo.status !== "active"))
    } catch (e: any) {
      alert("No se pudo cambiar el estado: " + e.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (promo: MedusaPromotion) => {
    if (!confirm(`¿Eliminar el cupón ${promo.code}?`)) return
    setBusyId(promo.id)
    try {
      await deletePromotion(promo.id)
      setPromotions((prev) => prev.filter((p) => p.id !== promo.id))
    } catch (e: any) {
      alert("No se pudo eliminar: " + e.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleExport = () =>
    exportToCSV(
      promotions.map((p) => ({
        Codigo: p.code,
        Tipo: p.application_method?.type === "fixed" ? "Monto fijo por unidad" : "Porcentaje",
        Valor: Number(p.application_method?.value ?? 0),
        "Aplica a": appliesTo(p),
        Estado: p.status === "active" ? "Activo" : "Inactivo",
        "Se puede usar en la tienda": isStoreCoupon(p) && p.status === "active" ? "Si" : "No",
        Creado: csvDate(p.created_at),
      })),
      "cupones-la-loya"
    )

  const activeCount = promotions.filter((p) => p.status === "active" && isStoreCoupon(p)).length

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="font-[family-name:var(--font-libre)] text-sm uppercase tracking-wider text-charcoal/30 animate-pulse">
          Cargando cupones...
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-libre)] text-3xl uppercase tracking-[0.05em] text-charcoal">
            Cupones de descuento
          </h1>
          <p className="mt-2 font-[family-name:var(--font-libre)] text-sm text-charcoal/40 uppercase tracking-[0.1em]">
            {promotions.length} cupones · {activeCount} activos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="btn-retro px-4 py-2 text-xs flex items-center gap-2">
            <Download size={14} />
            Exportar CSV
          </button>
          <button onClick={() => setEditing("new")} className="btn-retro px-6 py-3 text-sm flex items-center gap-2">
            <Plus size={16} />
            Nuevo cupón
          </button>
        </div>
      </div>

      {loadError && (
        <div className="card-retro mb-4 p-4">
          <p className="font-[family-name:var(--font-libre)] text-xs uppercase tracking-wider text-red-600">
            No se pudieron cargar los cupones: {loadError}
          </p>
        </div>
      )}

      {promotions.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Sin cupones"
          description="Creá un cupón y elegí a qué productos aplica. El cliente lo ingresa en el checkout."
        />
      ) : (
        <div className="card-retro overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal/10 bg-cream-dark">
                <th className="text-left py-3 px-4 font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40">Código</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40">Descuento</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hidden md:table-cell">Aplica a</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40">Estado</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promo) => {
                const usable = isStoreCoupon(promo)
                return (
                  <tr key={promo.id} className="border-b border-charcoal/5 hover:bg-charcoal/[0.02] transition-colors">
                    <td className="py-3 px-4 font-[family-name:var(--font-libre)] text-sm font-semibold text-charcoal">
                      {promo.code}
                    </td>
                    <td className="py-3 px-4 font-[family-name:var(--font-libre)] text-sm text-charcoal">
                      {discountText(promo)}
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell max-w-xs">
                      <span className={`text-xs ${usable ? "text-charcoal/60" : "text-red-600"}`}>
                        {appliesTo(promo)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggle(promo)}
                        disabled={!usable || busyId === promo.id}
                        className={`text-[10px] font-[family-name:var(--font-libre)] uppercase tracking-wider px-2 py-1 transition-colors disabled:opacity-50 ${
                          promo.status === "active"
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-charcoal/10 text-charcoal/60 hover:bg-charcoal/20"
                        }`}
                      >
                        {promo.status === "active" ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {usable && (
                          <button
                            onClick={() => setEditing(promo)}
                            className="p-2 text-charcoal/30 hover:text-rust transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(promo)}
                          disabled={busyId === promo.id}
                          className="p-2 text-charcoal/30 hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <CouponForm
          promo={editing === "new" ? null : editing}
          onSaved={replace}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}
