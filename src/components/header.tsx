"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, ShoppingBag, Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { CartBadge } from "@/components/cart-badge"

const navLinks = [
  { href: "/catalogo", label: "Todo" },
  { href: "/hombres", label: "Hombres" },
  { href: "/mujeres", label: "Mujeres" },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm">
      <div className="border-b border-charcoal/10">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex flex-col items-center">
            <span className="font-[family-name:var(--font-pacifico)] text-3xl text-rust tracking-wide">
              La Loya
            </span>
            <span className="font-[family-name:var(--font-oswald)] text-[9px] uppercase tracking-[0.3em] text-charcoal/60 -mt-1">
              Ropa & Café
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-[0.15em] px-4 py-2 text-charcoal/70 hover:text-rust transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden md:flex p-2 text-charcoal/60 hover:text-rust transition-colors">
              <Search size={18} strokeWidth={1.5} />
            </button>
            <Link
              href="/carrito"
              className="relative p-2 text-charcoal/60 hover:text-rust transition-colors"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              <CartBadge />
            </Link>
            <button
              className="md:hidden p-2 text-charcoal"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-charcoal/10 overflow-hidden bg-cream"
          >
            <nav className="flex flex-col px-6 py-6 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-[family-name:var(--font-oswald)] text-base uppercase tracking-[0.15em] text-charcoal/70 hover:text-rust py-3 border-b border-charcoal/5 last:border-0"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
