"use client"

import { useEffect, useState } from "react"
import { fetchPromotions, createPromotion, deletePromotion, type MedusaPromotion } from "@/lib/medusa"
import { EmptyState } from "@/components/admin/empty-state"
import { Tag, Plus, Trash2, X, Loader2, Download } from "lucide-react"
import { exportToCSV } from "@/lib/export-csv"

const typeLabels: Record<string, string> = {
  percentage: "Porcentaje",
  fixed: "Monto fijo",
}

function NewPromotionForm({ onCreated, onClose }: { onCreated: (p: MedusaPromotion) => void; onClose: () => void }) {
  const [code, setCode] = useState("")
  const [type, setType] = useState<"percentage" | "fixed">("percentage")
  const [value, setValue] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || !value) return
    setLoading(true)
    setError("")
    try {
      const promo = await createPromotion({
        code: code.toUpperCase(),
        type,
        value: Number(value),
        starts_at: startsAt || undefined,
        ends_at: endsAt || undefined,
      })
      onCreated(promo)
      onClose()
    } catch (err: any) {
      setError(err.message || "Error al crear promocion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream card-retro max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-[family-name:var(--font-oswald)] text-xl uppercase tracking-[0.05em] text-charcoal">
            Nueva promocion
          </h2>
          <button onClick={onClose} className="text-charcoal/40 hover:text-charcoal transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
              Codigo de descuento
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ej: VERANO2026"
              className="input-retro w-full px-4 py-3 text-sm mt-2 uppercase"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "percentage" | "fixed")}
                className="input-retro w-full px-4 py-3 text-sm mt-2"
              >
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto fijo ($)</option>
              </select>
            </div>
            <div>
              <label className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
                Valor
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === "percentage" ? "10" : "5000"}
                className="input-retro w-full px-4 py-3 text-sm mt-2"
                min="0"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
                Fecha inicio
              </label>
              <input
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="input-retro w-full px-4 py-3 text-sm mt-2"
              />
            </div>
            <div>
              <label className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
                Fecha fin
              </label>
              <input
                type="date"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="input-retro w-full px-4 py-3 text-sm mt-2"
              />
            </div>
          </div>
          {error && (
            <p className="text-xs text-red-600 font-[family-name:var(--font-oswald)] uppercase tracking-wider">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-retro w-full py-3 text-sm flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> Creando...</> : "Crear promocion"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function PromocionesPage() {
  const [promotions, setPromotions] = useState<MedusaPromotion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchPromotions().then((data) => {
      setPromotions(data)
      setLoading(false)
    })
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar esta promocion?")) return
    try {
      await deletePromotion(id)
      setPromotions((prev) => prev.filter((p) => p.id !== id))
    } catch {}
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider text-charcoal/30 animate-pulse">
          Cargando promociones...
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-oswald)] text-3xl uppercase tracking-[0.05em] text-charcoal">
            Promociones
          </h1>
          <p className="mt-2 font-[family-name:var(--font-oswald)] text-sm text-charcoal/40 uppercase tracking-[0.1em]">
            {promotions.length} promociones activas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToCSV(promotions.map((p) => ({
              Codigo: p.code,
              Tipo: typeLabels[p.type] || p.type,
              Valor: p.type === "percentage" ? `${p.value}%` : p.value,
              Inicio: p.starts_at ? new Date(p.starts_at).toLocaleDateString("es-AR") : "Sin fecha",
              Fin: p.ends_at ? new Date(p.ends_at).toLocaleDateString("es-AR") : "Sin fecha",
            })), "promociones-la-loya")}
            className="btn-retro px-4 py-2 text-xs flex items-center gap-2"
          >
            <Download size={14} />
            Exportar CSV
          </button>
          <button onClick={() => setShowForm(true)} className="btn-retro px-6 py-3 text-sm flex items-center gap-2">
            <Plus size={16} />
            Nueva promocion
          </button>
        </div>
      </div>

      {promotions.length === 0 ? (
        <EmptyState icon={Tag} title="Sin promociones" description="Crea tu primera promocion para ofrecer descuentos a tus clientes." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal/10">
                <th className="text-left py-3 px-4 font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40">Codigo</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hidden sm:table-cell">Tipo</th>
                <th className="text-right py-3 px-4 font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40">Valor</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hidden md:table-cell">Inicio</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hidden md:table-cell">Fin</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promo) => (
                <tr key={promo.id} className="border-b border-charcoal/5 hover:bg-charcoal/[0.02] transition-colors">
                  <td className="py-3 px-4 font-[family-name:var(--font-oswald)] text-sm font-semibold text-charcoal">
                    {promo.code}
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className="font-[family-name:var(--font-oswald)] text-xs text-charcoal/60 uppercase">
                      {typeLabels[promo.type] || promo.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-[family-name:var(--font-oswald)] text-sm text-charcoal">
                    {promo.type === "percentage" ? `${promo.value}%` : `$${promo.value.toLocaleString("es-AR")}`}
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell font-[family-name:var(--font-oswald)] text-xs text-charcoal/40">
                    {promo.starts_at ? new Date(promo.starts_at).toLocaleDateString("es-AR") : "Sin fecha"}
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell font-[family-name:var(--font-oswald)] text-xs text-charcoal/40">
                    {promo.ends_at ? new Date(promo.ends_at).toLocaleDateString("es-AR") : "Sin fecha"}
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => handleDelete(promo.id)} className="text-charcoal/30 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <NewPromotionForm
          onCreated={(p) => setPromotions((prev) => [...prev, p])}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  )
}