"use client"

import { useEffect, useState } from "react"
import { formatPrice } from "@/lib/utils"
import { fetchOrders, type MedusaOrder } from "@/lib/medusa"
import { EmptyState } from "@/components/admin/empty-state"
import { ShoppingCart, Eye, X, Download } from "lucide-react"
import { exportToCSV } from "@/lib/export-csv"

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  completed: { label: "Completado", color: "bg-green-100 text-green-800" },
  canceled: { label: "Cancelado", color: "bg-red-100 text-red-800" },
  archived: { label: "Archivado", color: "bg-gray-100 text-gray-600" },
  requires_action: { label: "Requiere accion", color: "bg-orange-100 text-orange-800" },
}

function OrderDetail({ order, onClose }: { order: MedusaOrder; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream card-retro max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-[family-name:var(--font-oswald)] text-xl uppercase tracking-[0.05em] text-charcoal">
              Pedido #{order.display_id}
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
                {order.customer ? `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim() || order.email : order.email}
              </p>
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

          {order.shipping_address && (
            <div className="p-4 bg-cream-dark/50">
              <span className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40">
                Direccion de envio
              </span>
              <p className="font-[family-name:var(--font-oswald)] text-sm text-charcoal mt-1">
                {order.shipping_address.address_1}, {order.shipping_address.city}, {order.shipping_address.country_code?.toUpperCase()}
              </p>
            </div>
          )}

          <div>
            <span className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40">
              Items
            </span>
            <div className="mt-2 space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-cream-dark/50">
                  <div>
                    <p className="font-[family-name:var(--font-oswald)] text-sm text-charcoal">{item.title}</p>
                    <p className="font-[family-name:var(--font-oswald)] text-xs text-charcoal/40">x{item.quantity}</p>
                  </div>
                  <span className="font-[family-name:var(--font-oswald)] text-sm text-charcoal">
                    {formatPrice(item.total || item.unit_price * item.quantity)}
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
  const [orders, setOrders] = useState<MedusaOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<MedusaOrder | null>(null)

  useEffect(() => {
    fetchOrders().then((data) => {
      setOrders(data)
      setLoading(false)
    })
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
            "#": o.display_id,
            Cliente: o.email,
            Estado: statusLabels[o.status]?.label || o.status,
            Total: o.total,
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
              <th className="text-left py-3 px-4 font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40">#</th>
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
                  <td className="py-3 px-4 font-[family-name:var(--font-oswald)] text-sm text-charcoal">
                    #{order.display_id}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-[family-name:var(--font-oswald)] text-sm text-charcoal">{order.email}</p>
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

      {selectedOrder && <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </>
  )
}
