"use client"

import { useEffect, useState } from "react"
import { formatPrice } from "@/lib/utils"
import { EmptyState } from "@/components/admin/empty-state"
import { Users, Download } from "lucide-react"
import { exportToCSV } from "@/lib/export-csv"

interface Customer {
  email: string
  name: string
  phone: string
  orders_count: number
  total_spent: number
  last_order: string
  last_status: string
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  approved: { label: "Aprobado", color: "bg-green-100 text-green-800" },
  rejected: { label: "Rechazado", color: "bg-red-100 text-red-800" },
}

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then((data: Customer[]) => {
        setCustomers(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider text-charcoal/30 animate-pulse">
          Cargando clientes...
        </p>
      </div>
    )
  }

  if (customers.length === 0) {
    return <EmptyState icon={Users} title="Sin clientes" description="Los clientes que compren en tu tienda apareceran aqui." />
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-oswald)] text-3xl uppercase tracking-[0.05em] text-charcoal">
            Clientes
          </h1>
          <p className="mt-2 font-[family-name:var(--font-oswald)] text-sm text-charcoal/40 uppercase tracking-[0.1em]">
            {customers.length} clientes
          </p>
        </div>
        <button
          onClick={() => exportToCSV(customers.map((c) => ({
            Nombre: c.name || "Sin nombre",
            Email: c.email,
            Telefono: c.phone || "",
            Pedidos: c.orders_count,
            "Gasto total": c.total_spent,
            "Ultimo pedido": new Date(c.last_order).toLocaleDateString("es-AR"),
            Estado: statusLabels[c.last_status]?.label || c.last_status,
          })), "clientes-la-loya")}
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
              <th className="text-left py-3 px-4 font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40">Nombre</th>
              <th className="text-left py-3 px-4 font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40">Email</th>
              <th className="text-left py-3 px-4 font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hidden sm:table-cell">Telefono</th>
              <th className="text-center py-3 px-4 font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hidden sm:table-cell">Pedidos</th>
              <th className="text-right py-3 px-4 font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hidden sm:table-cell">Gasto total</th>
              <th className="text-left py-3 px-4 font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hidden md:table-cell">Ultimo pedido</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.email} className="border-b border-charcoal/5 hover:bg-charcoal/[0.02] transition-colors">
                <td className="py-3 px-4 font-[family-name:var(--font-oswald)] text-sm text-charcoal">
                  {customer.name || "Sin nombre"}
                </td>
                <td className="py-3 px-4 font-[family-name:var(--font-oswald)] text-sm text-charcoal/60">
                  {customer.email}
                </td>
                <td className="py-3 px-4 font-[family-name:var(--font-oswald)] text-sm text-charcoal/40 hidden sm:table-cell">
                  {customer.phone || "-"}
                </td>
                <td className="py-3 px-4 text-center font-[family-name:var(--font-oswald)] text-sm text-charcoal hidden sm:table-cell">
                  {customer.orders_count}
                </td>
                <td className="py-3 px-4 text-right font-[family-name:var(--font-oswald)] text-sm text-charcoal hidden sm:table-cell">
                  {formatPrice(customer.total_spent)}
                </td>
                <td className="py-3 px-4 font-[family-name:var(--font-oswald)] text-xs text-charcoal/40 hidden md:table-cell">
                  {new Date(customer.last_order).toLocaleDateString("es-AR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
