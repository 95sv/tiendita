import { Truck, CreditCard, MapPin, Package } from "lucide-react"

export default function EnviosPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <span className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.3em] text-rust">
          Envios
        </span>
        <h1 className="font-[family-name:var(--font-oswald)] text-4xl uppercase tracking-[0.05em] text-charcoal mt-1">
          Envios y entregas
        </h1>
        <p className="mt-2 font-[family-name:var(--font-oswald)] text-sm text-charcoal/50 max-w-lg">
          Todo lo que necesitas saber sobre como llega tu pedido a tu casa.
        </p>
      </div>

      <div className="space-y-8">
        <div className="card-retro p-6">
          <div className="flex items-center gap-3 mb-4">
            <Truck size={20} className="text-rust" />
            <h2 className="font-[family-name:var(--font-oswald)] text-lg uppercase tracking-[0.05em] text-charcoal">
              Zonas de envio
            </h2>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-cream-dark/50">
              <h3 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider text-charcoal">
                Bahia Blanca y alrededores
              </h3>
              <p className="font-[family-name:var(--font-oswald)] text-sm text-charcoal/50 mt-1">
                Envio coordinado por WhatsApp. Coordinamos dia y hora de entrega.
              </p>
            </div>
            <div className="p-4 bg-cream-dark/50">
              <h3 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider text-charcoal">
                Interior del pais
              </h3>
              <p className="font-[family-name:var(--font-oswald)] text-sm text-charcoal/50 mt-1">
                Proximamente. Consultanos por disponibilidad.
              </p>
            </div>
          </div>
        </div>

        <div className="card-retro p-6">
          <div className="flex items-center gap-3 mb-4">
            <Package size={20} className="text-rust" />
            <h2 className="font-[family-name:var(--font-oswald)] text-lg uppercase tracking-[0.05em] text-charcoal">
              Tiempos de entrega
            </h2>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-cream-dark/50">
              <h3 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider text-charcoal">
                Retiro en persona
              </h3>
              <p className="font-[family-name:var(--font-oswald)] text-sm text-charcoal/50 mt-1">
                Coordinamos el dia y horario de retiro por WhatsApp. Sin costo adicional.
              </p>
            </div>
            <div className="p-4 bg-cream-dark/50">
              <h3 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider text-charcoal">
                Envio a domicilio
              </h3>
              <p className="font-[family-name:var(--font-oswald)] text-sm text-charcoal/50 mt-1">
                1 a 3 dias habiles despues de confirmado el pedido. Coordinamos por WhatsApp.
              </p>
            </div>
          </div>
        </div>

        <div className="card-retro p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard size={20} className="text-rust" />
            <h2 className="font-[family-name:var(--font-oswald)] text-lg uppercase tracking-[0.05em] text-charcoal">
              Formas de pago
            </h2>
          </div>
          <div className="space-y-2">
            <div className="p-4 bg-cream-dark/50">
              <p className="font-[family-name:var(--font-oswald)] text-sm text-charcoal">
                Transferencia bancaria (CBU)
              </p>
            </div>
            <div className="p-4 bg-cream-dark/50">
              <p className="font-[family-name:var(--font-oswald)] text-sm text-charcoal">
                Efectivo en efectivo
              </p>
            </div>
            <div className="p-4 bg-cream-dark/50">
              <p className="font-[family-name:var(--font-oswald)] text-sm text-charcoal">
                Mercado Pago
              </p>
            </div>
          </div>
        </div>

        <div className="card-retro p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin size={20} className="text-rust" />
            <h2 className="font-[family-name:var(--font-oswald)] text-lg uppercase tracking-[0.05em] text-charcoal">
              Consultas
            </h2>
          </div>
          <p className="font-[family-name:var(--font-oswald)] text-sm text-charcoal/60">
            Para consultas sobre envios, escribinos por{" "}
            <a href="/contacto" className="text-rust underline">
              WhatsApp
            </a>{" "}
            o al email{" "}
            <a href="mailto:info@laloya.com" className="text-rust underline">
              info@laloya.com
            </a>
            . Coordinamos todo de forma personalizada.
          </p>
        </div>
      </div>
    </div>
  )
}
