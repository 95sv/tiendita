"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
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
          <Link href="/" className="flex items-center transition-transform hover:scale-105 hover:opacity-80">
            <img src="/logo-wordmark-rust.png" alt="La Loya" className="h-[34px] w-auto block" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-[family-name:var(--font-libre)] text-sm uppercase tracking-[0.15em] px-4 py-2 text-charcoal/70 hover:text-rust transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden md:flex p-2 text-charcoal/60 hover:text-rust transition-colors">
              <svg width="19" height="19" viewBox="0 0 18 18" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                <line x1="12.5" y1="12.5" x2="17" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <Link
              href="/carrito"
              className="relative p-2 text-charcoal/60 hover:text-rust transition-colors"
            >
              <svg width="19" height="19" viewBox="0 0 18 18" fill="none">
                <path d="M4 6H14L13 16H5L4 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M6.5 6V4.5C6.5 3.12 7.62 2 9 2C10.38 2 11.5 3.12 11.5 4.5V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
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
                  className="font-[family-name:var(--font-libre)] text-base uppercase tracking-[0.15em] text-charcoal/70 hover:text-rust py-3 border-b border-charcoal/5 last:border-0"
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
