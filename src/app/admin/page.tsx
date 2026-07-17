"use client"

import { useAdminStore } from "@/store/admin"
import { Package, TrendingUp, DollarSign, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const products = useAdminStore((s) => s.products)

  const totalProducts = products.length
  const activeProducts = products.filter((p) => p.active).length
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const lowStock = products.filter((p) => p.stock < 10).length
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)

  const stats = [
    {
      label: "Productos",
      value: totalProducts,
      sub: `${activeProducts} activos`,
      icon: Package,
    },
    {
      label: "Stock total",
      value: totalStock,
      sub: `${lowStock} con stock bajo`,
      icon: AlertTriangle,
    },
    {
      label: "Valor del inventario",
      value: `$${totalValue.toLocaleString("es-AR")}`,
      sub: "En pesos",
      icon: DollarSign,
    },
    {
      label: "Categorías",
      value: 3,
      sub: "Hombres, Mujeres, Ofertas",
      icon: TrendingUp,
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <span className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.3em] text-rust">
          Admin
        </span>
        <h1 className="font-[family-name:var(--font-oswald)] text-3xl uppercase tracking-[0.05em] text-charcoal mt-1">
          Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card-retro p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40">
                {stat.label}
              </span>
              <stat.icon size={16} className="text-rust" />
            </div>
            <p className="font-[family-name:var(--font-oswald)] text-2xl font-bold text-charcoal">
              {stat.value}
            </p>
            <p className="text-xs text-charcoal/40 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="card-retro p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-[0.15em] text-charcoal">
            Productos recientes
          </h2>
          <Link
            href="/admin/productos"
            className="font-[family-name:var(--font-oswald)] text-xs uppercase tracking-wider text-rust hover:text-rust-dark transition-colors"
          >
            Ver todos
          </Link>
        </div>
        <div className="space-y-3">
          {products.slice(0, 5).map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-3 bg-cream rounded"
            >
              <div className="h-12 w-10 bg-cream-dark flex-shrink-0 flex items-center justify-center text-[8px] text-charcoal/20">
                img
              </div>
              <div className="flex-1">
                <p className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider text-charcoal">
                  {product.name}
                </p>
                <p className="text-xs text-charcoal/40">
                  ${product.price.toLocaleString("es-AR")} · Stock: {product.stock}
                </p>
              </div>
              <span
                className={`text-[10px] font-[family-name:var(--font-oswald)] uppercase tracking-wider px-2 py-1 rounded ${
                  product.active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {product.active ? "Activo" : "Inactivo"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
