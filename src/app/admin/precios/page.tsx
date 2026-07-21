"use client"

import { useEffect, useState } from "react"
import { fetchPriceLists, createPriceList, deletePriceList, type MedusaPriceList } from "@/lib/medusa"
import { EmptyState } from "@/components/admin/empty-state"
import { BadgeDollarSign, Plus, Trash2, X, Loader2 } from "lucide-react"

function NewPriceListForm({ onCreated, onClose }: { onCreated: (p: MedusaPriceList) => void; onClose: () => void }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("sale")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    setLoading(true)
    setError("")
    try {
      const list = await createPriceList({ name, description: description || undefined, type })
      onCreated(list)
      onClose()
    } catch (err: any) {
      setError(err.message || "Error al crear lista de precios")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream card-retro max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-[family-name:var(--font-libre)] text-xl uppercase tracking-[0.05em] text-charcoal">
            Nueva lista de precios
          </h2>
          <button onClick={onClose} className="text-charcoal/40 hover:text-charcoal transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Lista Mayorista"
              className="input-retro w-full px-4 py-3 text-sm mt-2"
              required
            />
          </div>
          <div>
            <label className="font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
              Descripcion
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripcion opcional"
              className="input-retro w-full px-4 py-3 text-sm mt-2"
            />
          </div>
          <div>
            <label className="font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
              Tipo
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input-retro w-full px-4 py-3 text-sm mt-2"
            >
              <option value="sale">Venta</option>
              <option value="override">Override</option>
            </select>
          </div>
          {error && (
            <p className="text-xs text-red-600 font-[family-name:var(--font-libre)] uppercase tracking-wider">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-retro w-full py-3 text-sm flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> Creando...</> : "Crear lista"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function PreciosPage() {
  const [priceLists, setPriceLists] = useState<MedusaPriceList[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchPriceLists().then((data) => {
      setPriceLists(data)
      setLoading(false)
    })
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar esta lista de precios?")) return
    try {
      await deletePriceList(id)
      setPriceLists((prev) => prev.filter((p) => p.id !== id))
    } catch {}
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="font-[family-name:var(--font-libre)] text-sm uppercase tracking-wider text-charcoal/30 animate-pulse">
          Cargando listas de precios...
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-libre)] text-3xl uppercase tracking-[0.05em] text-charcoal">
            Listas de precio
          </h1>
          <p className="mt-2 font-[family-name:var(--font-libre)] text-sm text-charcoal/40 uppercase tracking-[0.1em]">
            {priceLists.length} listas configuradas
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-retro px-6 py-3 text-sm flex items-center gap-2">
          <Plus size={16} />
          Nueva lista
        </button>
      </div>

      {priceLists.length === 0 ? (
        <EmptyState icon={BadgeDollarSign} title="Sin listas de precio" description="Crea listas de precios para gestionar precios mayoristas, temporadas o promociones especiales." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal/10">
                <th className="text-left py-3 px-4 font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40">Nombre</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hidden sm:table-cell">Tipo</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hidden sm:table-cell">Estado</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hidden md:table-cell">Inicio</th>
                <th className="text-left py-3 px-4 font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hidden md:table-cell">Fin</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {priceLists.map((list) => (
                <tr key={list.id} className="border-b border-charcoal/5 hover:bg-charcoal/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-[family-name:var(--font-libre)] text-sm text-charcoal">{list.name}</p>
                    {list.description && (
                      <p className="font-[family-name:var(--font-libre)] text-xs text-charcoal/40 mt-0.5">{list.description}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className="font-[family-name:var(--font-libre)] text-xs text-charcoal/60 uppercase">{list.type}</span>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className={`inline-block px-2 py-0.5 text-xs font-[family-name:var(--font-libre)] uppercase ${list.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                      {list.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell font-[family-name:var(--font-libre)] text-xs text-charcoal/40">
                    {list.starts_at ? new Date(list.starts_at).toLocaleDateString("es-AR") : "Sin fecha"}
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell font-[family-name:var(--font-libre)] text-xs text-charcoal/40">
                    {list.ends_at ? new Date(list.ends_at).toLocaleDateString("es-AR") : "Sin fecha"}
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => handleDelete(list.id)} className="text-charcoal/30 hover:text-red-500 transition-colors">
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
        <NewPriceListForm
          onCreated={(p) => setPriceLists((prev) => [...prev, p])}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  )
}
