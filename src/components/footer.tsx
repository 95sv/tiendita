import Link from "next/link"

const footerLinks = {
  tienda: [
    { href: "/catalogo", label: "Catálogo" },
    { href: "/hombres", label: "Hombres" },
    { href: "/mujeres", label: "Mujeres" },
  ],
  ayuda: [
    { href: "/contacto", label: "Contacto" },
    { href: "/envios", label: "Envíos" },
    { href: "/devoluciones", label: "Devoluciones" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-charcoal text-cream">
      <div className="border-b border-cream/10">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <img src="/logo-cream.png" alt="La Loya" className="h-[40px] w-auto block" />
              <p className="mt-3 text-sm text-cream/50 leading-relaxed max-w-xs">
                Ropa de diseño y café de especialidad. Bahía Blanca, Argentina.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-cream/40 font-[family-name:var(--font-libre)] uppercase tracking-[0.15em]">
                <span className="w-8 h-px bg-cream/20" />
                Lun — Sáb 7am a 8pm
                <span className="w-8 h-px bg-cream/20" />
              </div>
            </div>

            <div>
              <h4 className="font-[family-name:var(--font-libre)] text-xs uppercase tracking-[0.2em] text-cream/40 mb-4">
                Tienda
              </h4>
              <ul className="space-y-2">
                {footerLinks.tienda.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-cream/60 hover:text-rust transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-[family-name:var(--font-libre)] text-xs uppercase tracking-[0.2em] text-cream/40 mb-4">
                Ayuda
              </h4>
              <ul className="space-y-2">
                {footerLinks.ayuda.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-cream/60 hover:text-rust transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream/30 font-[family-name:var(--font-libre)] uppercase tracking-[0.15em]">
            &copy; {new Date().getFullYear()} La Loya. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-1 text-[10px] text-cream/30 font-[family-name:var(--font-libre)] uppercase tracking-[0.2em]">
            <span className="w-2 h-2 border border-rust rounded-full" />
            Hecho con amor en Bahía Blanca
          </div>
        </div>
      </div>
    </footer>
  )
}
