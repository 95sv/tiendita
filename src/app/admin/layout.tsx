"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Package, ArrowLeft, LogOut, ShoppingCart, Users, Tag, BadgeDollarSign, RotateCcw } from "lucide-react"
import { useEffect, useState } from "react"
import { adminLogin, adminLogout, isAdminLoggedIn } from "@/lib/medusa"

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/promociones", label: "Promociones", icon: Tag },
  { href: "/admin/precios", label: "Listas de precio", icon: BadgeDollarSign },
  { href: "/admin/devoluciones", label: "Devoluciones", icon: RotateCcw },
]

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("admin@laloya.com")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await adminLogin(email, password)
      onLogin()
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="card-retro p-8 w-full max-w-md">
        <h1 className="font-[family-name:var(--font-pacifico)] text-3xl text-rust text-center mb-2">
          La Loya
        </h1>
        <p className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.3em] text-charcoal/40 text-center mb-8">
          Panel de administración
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-retro w-full px-4 py-3 text-sm mt-2"
              required
            />
          </div>
          <div>
            <label className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-retro w-full px-4 py-3 text-sm mt-2"
              required
            />
          </div>
          {error && (
            <p className="text-xs text-red-600 font-[family-name:var(--font-oswald)] uppercase tracking-wider">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-retro w-full py-3 text-sm"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    setChecked(true)
    setLoggedIn(isAdminLoggedIn())
  }, [])

  const handleLogout = () => {
    adminLogout()
    setLoggedIn(false)
    router.push("/")
  }

  if (!checked) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider text-charcoal/40">
          Cargando...
        </p>
      </div>
    )
  }

  if (!loggedIn) {
    return <LoginScreen onLogin={() => setLoggedIn(true)} />
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="w-64 bg-charcoal text-cream flex flex-col">
        <div className="p-6 border-b border-cream/10">
          <Link
            href="/"
            className="flex items-center gap-2 text-cream/50 hover:text-cream transition-colors text-xs font-[family-name:var(--font-oswald)] uppercase tracking-wider"
          >
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

        <div className="p-4 border-t border-cream/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm font-[family-name:var(--font-oswald)] uppercase tracking-wider text-cream/40 hover:text-red-400 transition-colors w-full"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
