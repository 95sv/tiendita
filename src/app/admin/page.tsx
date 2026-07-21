"use client"

import { useEffect, useState } from "react"
import { useAdminStore } from "@/store/admin"
import { fetchCustomers, fetchPromotions } from "@/lib/medusa"
import { Package, DollarSign, ShoppingCart, Users, Tag, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const { products, loading, loadProducts } = useAdminStore()
  const [orderCount, setOrderCount] = useState(0)
  const [customerCount, setCustomerCount] = useState(0)
  const [promoCount, setPromoCount] = useState(0)

  useEffect(() => {
    loadProducts()
    fetch("/api/orders").then((r) => r.json()).then((o) => setOrderCount(o.length)).catch(() => {})
    fetchCustomers().then((c) => setCustomerCount(c.length)).catch(() => {})
    fetchPromotions().then((p) => setPromoCount(p.length)).catch(() => {})
  }, [loadProducts])

  const totalProducts = products.length
  const activeProducts = products.filter((p) => p.active).length
  const totalValue = products.reduce((sum, p) => sum + p.price * 50, 0)

  const stats = [
    {
      label: "Productos",
      value: totalProducts,
      sub: `${activeProducts} activos`,
      icon: Package,
      href: "/admin/productos",
    },
    {
      label: "Pedidos",
      value: orderCount,
      sub: "Totales",
      icon: ShoppingCart,
      href: "/admin/pedidos",
    },
    {
      label: "Clientes",
      value: customerCount,
      sub: "Registrados",
      icon: Users,
      href: "/admin/clientes",
    },
    {
      label: "Promociones",
      value: promoCount,
      sub: "Activas",
      icon: Tag,
      href: "/admin/promociones",
    },
  ]

  const quickLinks = [
    { label: "Productos", href: "/admin/productos", icon: Package },
    { label: "Pedidos", href: "/admin/pedidos", icon: ShoppingCart },
    { label: "Promociones", href: "/admin/promociones", icon: Tag },
    { label: "Listas de precio", href: "/admin/precios", icon: DollarSign },
    { label: "Clientes", href: "/admin/clientes", icon: Users },
    { label: "Devoluciones", href: "/admin/devoluciones", icon: TrendingUp },
  ]

  return (
    <div>
      <div className="mb-8">
        <span className="font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.3em] text-rust">
          Admin
        </span>
        <h1 className="font-[family-name:var(--font-libre)] text-3xl uppercase tracking-[0.05em] text-charcoal mt-1">
          Dashboard
        </h1>
      </div>

      {loading && (
        <div className="card-retro p-8 text-center">
          <p className="font-[family-name:var(--font-libre)] text-sm uppercase tracking-wider text-charcoal/40 animate-pulse">
            Cargando datos...
          </p>
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Link key={stat.label} href={stat.href} className="card-retro p-5 hover:shadow-retro transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/40">
                    {stat.label}
                  </span>
                  <stat.icon size={16} className="text-rust" />
                </div>
                <p className="font-[family-name:var(--font-libre)] text-2xl font-bold text-charcoal">
                  {stat.value}
                </p>
                <p className="text-xs text-charcoal/40 mt-1">{stat.sub}</p>
              </Link>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card-retro p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-libre)] text-sm uppercase tracking-[0.15em] text-charcoal">
                  Accesos rapidos
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 p-3 bg-cream hover:bg-charcoal/5 transition-colors"
                  >
                    <link.icon size={16} className="text-rust" />
                    <span className="font-[family-name:var(--font-libre)] text-xs uppercase tracking-wider text-charcoal">
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="card-retro p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-libre)] text-sm uppercase tracking-[0.15em] text-charcoal">
                  Productos recientes
                </h2>
                <Link
                  href="/admin/productos"
                  className="font-[family-name:var(--font-libre)] text-xs uppercase tracking-wider text-rust hover:text-rust-dark transition-colors"
                >
                  Ver todos
                </Link>
              </div>
              <div className="space-y-3">
                {products.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-3 bg-cream"
                  >
                    <div className="h-12 w-10 bg-cream-dark flex-shrink-0 flex items-center justify-center text-[8px] text-charcoal/20 overflow-hidden">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        "img"
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-[family-name:var(--font-libre)] text-sm uppercase tracking-wider text-charcoal">
                        {product.name}
                      </p>
                      <p className="text-xs text-charcoal/40">
                        ${product.price.toLocaleString("es-AR")}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-[family-name:var(--font-libre)] uppercase tracking-wider px-2 py-1 ${
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
        </>
      )}
    </div>
  )
}
