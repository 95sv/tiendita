"use client"

import { useEffect, useState } from "react"
import { formatPrice } from "@/lib/utils"
import { EmptyState } from "@/components/admin/empty-state"
import { ShoppingCart, Eye, X, Download } from "lucide-react"
import { exportToCSV } from "@/lib/export-csv"

interface SupabaseOrder {
  id: string
  external_reference: string
  payment_id: string
  status: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  customer_city: string
  customer_province: string
  customer_postal_code: string
  items: { name: string; quantity: number; price: number }[]
  total: number
  currency: string
  payment_method: string
  created_at: string
  updated_at: string
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  approved: { label: "Aprobado", color: "bg-green-100 text-green-800" },
  rejected: { label: "Rechazado", color: "bg-red-100 text-red-800" },
  canceled: { label: "Cancelado", color: "bg-red-100 text-red-800" },
  refunded: { label: "Reembolsado", color: "bg-purple-100 text-purple-800" },
  in_process: { label: "En proceso", color: "bg-orange-100 text-orange-800" },
}

function OrderDetail({ order, onClose, onStatusChange }: { order: SupabaseOrder; onClose: () => void; onStatusChange: (id: string, status: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream card-retro max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-[family-name:var(--font-oswald)] text-xl uppercase tracking-[0.05em] text-charcoal">
              Pedido {order.external_reference}
            </h2>
            <p className="font-[family-name:var(--font-oswald)] text-xs text-charcoal/40 mt-1">
              {new Date(order.created_at).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <button onClick={onClose} className="text-charcoal/40 hover:text-charcoal transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-cream-dark/50">
              <span className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40">
                Cliente
              </span>
              <p className="font-[family-name:var(--font-oswald)] text-sm text-charcoal mt-1">
                {order.customer_name || "Sin nombre"}
              </p>
              <p className="font-[family-name:var(--font-oswald)] text-xs text-charcoal/50 mt-1">
                {order.customer_email}
              </p>
              {order.customer_phone && (
                <p className="font-[family-name:var(--font-oswald)] text-xs text-charcoal/50">
                  {order.customer_phone}
                </p>
              )}
            </div>
            <div className="p-4 bg-cream-dark/50">
              <span className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40">
                Estado
              </span>
              <div className="mt-1">
                {(() => {
                  const s = statusLabels[order.status] || { label: order.status, color: "bg-gray-100 text-gray-600" }
                  return <span className={`inline-block px-2 py-0.5 text-xs font-[family-name:var(--font-oswald)] uppercase ${s.color}`}>{s.label}</span>
                })()}
              </div>
            </div>
          </div>

          <div className="p-4 bg-cream-dark/50">
            <span className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40">
              Cambiar estado
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { value: "approved", label: "Aprobado", color: "bg-green-100 text-green-800 hover:bg-green-200" },
                { value: "pending", label: "Pendiente", color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
                { value: "rejected", label: "Rechazado", color: "bg-red-100 text-red-800 hover:bg-red-200" },
                { value: "canceled", label: "Cancelado", color: "bg-red-100 text-red-800 hover:bg-red-200" },
                { value: "refunded", label: "Reembolsado", color: "bg-purple-100 text-purple-800 hover:bg-purple-200" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  disabled={order.status === opt.value}
                  onClick={() => onStatusChange(order.id, opt.value)}
                  className={`font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-wider px-3 py-1.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed ${opt.color}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {order.customer_address && (
            <div className="p-4 bg-cream-dark/50">
              <span className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40">
                Direccion de envio
              </span>
              <p className="font-[family-name:var(--font-oswald)] text-sm text-charcoal mt-1">
                {order.customer_address}{order.customer_city ? `, ${order.customer_city}` : ""}{order.customer_province ? `, ${order.customer_province}` : ""}
              </p>
            </div>
          )}

          <div>
            <span className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40">
              Items
            </span>
            <div className="mt-2 space-y-2">
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-cream-dark/50">
                  <div>
                    <p className="font-[family-name:var(--font-oswald)] text-sm text-charcoal">{item.name}</p>
                    <p className="font-[family-name:var(--font-oswald)] text-xs text-charcoal/40">x{item.quantity}</p>
                  </div>
                  <span className="font-[family-name:var(--font-oswald)] text-sm text-charcoal">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-charcoal/10">
            <span className="font-[family-name:var(--font-oswald)] text-sm uppercase text-charcoal/50">Total</span>
            <span className="font-[family-name:var(--font-oswald)] text-lg font-semibold text-charcoal">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<SupabaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<SupabaseOrder | null>(null)

  const handleStatusChange = async (id: string, status: string) => {
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o))
    if (selectedOrder?.id === id) {
      setSelectedOrder((prev) => prev ? { ...prev, status } : null)
    }
  }

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data: SupabaseOrder[]) => {
        setOrders(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider text-charcoal/30 animate-pulse">
          Cargando pedidos...
        </p>
      </div>
    )
  }

  if (orders.length === 0) {
    return <EmptyState icon={ShoppingCart} title="Sin pedidos" description="Los pedidos de tus clientes apareceran aqui cuando realicen compras." />
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-oswald)] text-3xl uppercase tracking-[0.05em] text-charcoal">
            Pedidos
          </h1>
          <p className="mt-2 font-[family-name:var(--font-oswald)] text-sm text-charcoal/40 uppercase tracking-[0.1em]">
            {orders.length} pedidos totales
          </p>
        </div>
        <button
          onClick={() => exportToCSV(orders.map((o) => ({
            "#": o.external_reference,
            Cliente: o.customer_name || o.customer_email,
            Email: o.customer_email,
            Telefono: o.customer_phone || "",
            Direccion: o.customer_address || "",
            Ciudad: o.customer_city || "",
            Provincia: o.customer_province || "",
            Estado: statusLabels[o.status]?.label || o.status,
            Total: o.total,
            Metodo: o.payment_method || "",
            Fecha: new Date(o.created_at).toLocaleDateString("es-AR"),
          })), "pedidos-la-loya")}
          className="btn-retro px-4 py-2 text-xs flex items-center gap-2"
        >
          <Download size={14} />
          Exportar CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-charcoal/10">
              <th className="text-left py-3 px-4 font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40">Ref</th>
              <th className="text-left py-3 px-4 font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40">Cliente</th>
              <th className="text-left py-3 px-4 font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hidden sm:table-cell">Estado</th>
              <th className="text-right py-3 px-4 font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40">Total</th>
              <th className="text-left py-3 px-4 font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hidden md:table-cell">Fecha</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const s = statusLabels[order.status] || { label: order.status, color: "bg-gray-100 text-gray-600" }
              return (
                <tr key={order.id} className="border-b border-charcoal/5 hover:bg-charcoal/[0.02] transition-colors">
                  <td className="py-3 px-4 font-[family-name:var(--font-oswald)] text-xs text-charcoal/40">
                    {order.external_reference}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-[family-name:var(--font-oswald)] text-sm text-charcoal">{order.customer_name || "Sin nombre"}</p>
                    <p className="font-[family-name:var(--font-oswald)] text-xs text-charcoal/40">{order.customer_email}</p>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className={`inline-block px-2 py-0.5 text-xs font-[family-name:var(--font-oswald)] uppercase ${s.color}`}>
                      {s.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-[family-name:var(--font-oswald)] text-sm text-charcoal">
                    {formatPrice(order.total)}
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell font-[family-name:var(--font-oswald)] text-xs text-charcoal/40">
                    {new Date(order.created_at).toLocaleDateString("es-AR")}
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => setSelectedOrder(order)} className="text-charcoal/30 hover:text-rust transition-colors">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectedOrder && <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusChange={handleStatusChange} />}
    </>
  )
}
