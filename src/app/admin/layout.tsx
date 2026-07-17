"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, Plus, ArrowLeft } from "lucide-react"

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/productos/nuevo", label: "Nuevo producto", icon: Plus },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Sidebar */}
      <aside className="w-64 bg-charcoal text-cream flex flex-col">
        <div className="p-6 border-b border-cream/10">
          <Link href="/" className="flex items-center gap-2 text-cream/50 hover:text-cream transition-colors text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider">
            <ArrowLeft size={14} />
            Volver a la tienda
          </Link>
          <h1 className="font-[family-name:var(--font-pacifico)] text-2xl text-rust mt-4">
            La Loya
          </h1>
          <span className="font-[family-name:var(--font-oswald)] text-[9px] uppercase tracking-[0.3em] text-cream/40">
            Panel de administración
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-[family-name:var(--font-oswald)] uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-rust text-cream"
                    : "text-cream/60 hover:text-cream hover:bg-cream/5"
                }`}
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
