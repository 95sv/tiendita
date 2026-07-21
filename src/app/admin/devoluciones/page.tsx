"use client"

import { useEffect, useState } from "react"
import { fetchReturns, type MedusaReturn } from "@/lib/medusa"
import { EmptyState } from "@/components/admin/empty-state"
import { RotateCcw } from "lucide-react"

const returnStatusLabels: Record<string, { label: string; color: string }> = {
  open: { label: "Abierto", color: "bg-yellow-100 text-yellow-800" },
  canceled: { label: "Cancelado", color: "bg-gray-100 text-gray-600" },
  requested: { label: "Solicitado", color: "bg-blue-100 text-blue-800" },
  received: { label: "Recibido", color: "bg-green-100 text-green-800" },
  partially_received: { label: "Parcial", color: "bg-orange-100 text-orange-800" },
}

export default function DevolucionesPage() {
  const [returns, setReturns] = useState<MedusaReturn[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReturns().then((data) => {
      setReturns(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="font-[family-name:var(--font-libre)] text-sm uppercase tracking-wider text-charcoal/30 animate-pulse">
          Cargando devoluciones...
        </p>
      </div>
    )
  }

  if (returns.length === 0) {
    return (
      <EmptyState
        icon={RotateCcw}
        title="Sin devoluciones"
        description="Las solicitudes de devolucion y cambio de tus clientes apareceran aqui cuando las reciban."
      />
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-libre)] text-3xl uppercase tracking-[0.05em] text-charcoal">
          Devoluciones
        </h1>
        <p className="mt-2 font-[family-name:var(--font-libre)] text-sm text-charcoal/40 uppercase tracking-[0.1em]">
          {returns.length} devoluciones registradas
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-charcoal/10">
              <th className="text-left py-3 px-4 font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40">ID</th>
              <th className="text-left py-3 px-4 font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hidden sm:table-cell">Pedido</th>
              <th className="text-left py-3 px-4 font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40">Estado</th>
              <th className="text-left py-3 px-4 font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hidden md:table-cell">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((ret) => {
              const s = returnStatusLabels[ret.status] || { label: ret.status, color: "bg-gray-100 text-gray-600" }
              return (
                <tr key={ret.id} className="border-b border-charcoal/5 hover:bg-charcoal/[0.02] transition-colors">
                  <td className="py-3 px-4 font-[family-name:var(--font-libre)] text-sm text-charcoal">
                    {ret.id.slice(-8)}
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell font-[family-name:var(--font-libre)] text-sm text-charcoal/60">
                    {ret.order_id?.slice(-8) || "-"}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 text-xs font-[family-name:var(--font-libre)] uppercase ${s.color}`}>
                      {s.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell font-[family-name:var(--font-libre)] text-xs text-charcoal/40">
                    {new Date(ret.created_at).toLocaleDateString("es-AR")}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
