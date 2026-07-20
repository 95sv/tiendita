"use client"

import { useEffect, useState } from "react"
import { formatPrice } from "@/lib/utils"
import { fetchCustomers, type MedusaCustomer } from "@/lib/medusa"
import { EmptyState } from "@/components/admin/empty-state"
import { Users, Download } from "lucide-react"
import { exportToCSV } from "@/lib/export-csv"

export default function ClientesPage() {
  const [customers, setCustomers] = useState<MedusaCustomer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomers().then((data) => {
      setCustomers(data)
      setLoading(false)
    })
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
    return <EmptyState icon={Users} title="Sin clientes" description="Los clientes que se registren en tu tienda apareceran aqui." />
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-oswald)] text-3xl uppercase tracking-[0.05em] text-charcoal">
            Clientes
          </h1>
          <p className="mt-2 font-[family-name:var(--font-oswald)] text-sm text-charcoal/40 uppercase tracking-[0.1em]">
            {customers.length} clientes registrados
          </p>
        </div>
        <button
          onClick={() => exportToCSV(customers.map((c) => ({
            Nombre: `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Sin nombre",
            Email: c.email,
            Pedidos: c.orders_count,
            "Gasto total": c.total_spent,
            Registro: new Date(c.created_at).toLocaleDateString("es-AR"),
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
              <th className="text-center py-3 px-4 font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hidden sm:table-cell">Pedidos</th>
              <th className="text-right py-3 px-4 font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hidden sm:table-cell">Gasto total</th>
              <th className="text-left py-3 px-4 font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hidden md:table-cell">Registro</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-charcoal/5 hover:bg-charcoal/[0.02] transition-colors">
                <td className="py-3 px-4 font-[family-name:var(--font-oswald)] text-sm text-charcoal">
                  {`${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "Sin nombre"}
                </td>
                <td className="py-3 px-4 font-[family-name:var(--font-oswald)] text-sm text-charcoal/60">
                  {customer.email}
                </td>
                <td className="py-3 px-4 text-center font-[family-name:var(--font-oswald)] text-sm text-charcoal hidden sm:table-cell">
                  {customer.orders_count}
                </td>
                <td className="py-3 px-4 text-right font-[family-name:var(--font-oswald)] text-sm text-charcoal hidden sm:table-cell">
                  {formatPrice(customer.total_spent)}
                </td>
                <td className="py-3 px-4 font-[family-name:var(--font-oswald)] text-xs text-charcoal/40 hidden md:table-cell">
                  {new Date(customer.created_at).toLocaleDateString("es-AR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
