"use client"

import { useState } from "react"
import { Send, MapPin, Clock, Mail } from "lucide-react"

export default function ContactoPage() {
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <span className="font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.3em] text-rust">
          Contacto
        </span>
        <h1 className="font-[family-name:var(--font-libre)] text-4xl uppercase tracking-[0.05em] text-charcoal mt-1">
          Hablemos
        </h1>
        <p className="mt-2 font-[family-name:var(--font-libre)] text-sm text-charcoal/50 max-w-lg">
          Tenes alguna pregunta sobre nuestros productos, pedidos o algo mas? Escribinos y te respondemos a la brevedad.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="font-[family-name:var(--font-libre)] text-lg uppercase tracking-[0.05em] text-charcoal mb-6">
            Enviá tu consulta
          </h2>
          {sent ? (
            <div className="card-retro p-8 text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Send size={20} className="text-green-600" />
              </div>
              <h3 className="font-[family-name:var(--font-libre)] text-lg uppercase text-charcoal">
                Mensaje enviado
              </h3>
              <p className="mt-2 font-[family-name:var(--font-libre)] text-sm text-charcoal/50">
                Te vamos a responder lo antes posible. Gracias por contactarnos!
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-6 btn-retro-outline px-6 py-2 text-sm"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  className="input-retro w-full px-4 py-3 text-sm mt-2"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="input-retro w-full px-4 py-3 text-sm mt-2"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
                  Mensaje
                </label>
                <textarea
                  required
                  rows={5}
                  className="input-retro w-full px-4 py-3 text-sm mt-2 resize-none"
                  placeholder="Contanos en que podemos ayudarte..."
                />
              </div>
              <button type="submit" className="btn-retro px-8 py-3 text-sm flex items-center gap-2">
                <Send size={14} />
                Enviar mensaje
              </button>
            </form>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="font-[family-name:var(--font-libre)] text-lg uppercase tracking-[0.05em] text-charcoal mb-6">
            Informacion del local
          </h2>
          <div className="card-retro p-5 flex items-start gap-4">
            <MapPin size={20} className="text-rust mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-[family-name:var(--font-libre)] text-sm uppercase tracking-wider text-charcoal">
                Direccion
              </h3>
              <p className="font-[family-name:var(--font-libre)] text-sm text-charcoal/50 mt-1">
                Bahia Blanca, Buenos Aires, Argentina
              </p>
            </div>
          </div>
          <div className="card-retro p-5 flex items-start gap-4">
            <Clock size={20} className="text-rust mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-[family-name:var(--font-libre)] text-sm uppercase tracking-wider text-charcoal">
                Horario
              </h3>
              <p className="font-[family-name:var(--font-libre)] text-sm text-charcoal/50 mt-1">
                Viernes 19 hs
              </p>
            </div>
          </div>
          <div className="card-retro p-5 flex items-start gap-4">
            <Mail size={20} className="text-rust mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-[family-name:var(--font-libre)] text-sm uppercase tracking-wider text-charcoal">
                Email
              </h3>
              <p className="font-[family-name:var(--font-libre)] text-sm text-charcoal/50 mt-1">
                info@laloya.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
