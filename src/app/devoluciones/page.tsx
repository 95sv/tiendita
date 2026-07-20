import { RotateCcw, CheckCircle, XCircle, MessageCircle } from "lucide-react"

export default function DevolucionesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <span className="font-[family-name:var(--font-oswald)] text-[10px] uppercase tracking-[0.3em] text-rust">
          Devoluciones
        </span>
        <h1 className="font-[family-name:var(--font-oswald)] text-4xl uppercase tracking-[0.05em] text-charcoal mt-1">
          Politica de devoluciones
        </h1>
        <p className="mt-2 font-[family-name:var(--font-oswald)] text-sm text-charcoal/50 max-w-lg">
          Queremos que estes conforme con tu compra. Si algo no te convence, te explicamos como proceder.
        </p>
      </div>

      <div className="space-y-8">
        <div className="card-retro p-6">
          <div className="flex items-center gap-3 mb-4">
            <RotateCcw size={20} className="text-rust" />
            <h2 className="font-[family-name:var(--font-oswald)] text-lg uppercase tracking-[0.05em] text-charcoal">
              Plazo para devolver
            </h2>
          </div>
          <p className="font-[family-name:var(--font-oswald)] text-sm text-charcoal/60">
            Tenes hasta <strong className="text-charcoal">30 dias</strong> desde que recibiste tu pedido para solicitar una devolucion o cambio.
          </p>
        </div>

        <div className="card-retro p-6">
          <h2 className="font-[family-name:var(--font-oswald)] text-lg uppercase tracking-[0.05em] text-charcoal mb-4">
            Condiciones para la devolucion
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={16} className="text-green-600" />
                <h3 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider text-green-800">
                  Se puede devolver
                </h3>
              </div>
              <ul className="space-y-1 font-[family-name:var(--font-oswald)] text-sm text-green-700">
                <li>- Producto con etiqueta puesta</li>
                <li>- Sin usar ni lavar</li>
                <li>- En su packaging original</li>
                <li>- Defectos de fabrica</li>
              </ul>
            </div>
            <div className="p-4 bg-red-50 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <XCircle size={16} className="text-red-600" />
                <h3 className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wider text-red-800">
                  No se acepta
                </h3>
              </div>
              <ul className="space-y-1 font-[family-name:var(--font-oswald)] text-sm text-red-700">
                <li>- Productos usados o lavados</li>
                <li>- Sin etiqueta</li>
                <li>- Danos por mal uso</li>
                <li>- Productos en oferta (salvo defecto)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="card-retro p-6">
          <h2 className="font-[family-name:var(--font-oswald)] text-lg uppercase tracking-[0.05em] text-charcoal mb-4">
            Como solicitar la devolucion
          </h2>
          <div className="space-y-4">
            {[
              { step: "1", text: "Contactanos por WhatsApp o email indicando tu numero de pedido y el motivo de la devolucion." },
              { step: "2", text: "Te vamos a indicar como y donde entregar o enviar el producto." },
              { step: "3", text: "Una vez recibido y revisado el producto, te ofrecemos un cambio o reembolso." },
              { step: "4", text: "El reembolso se realiza en un plazo de 5 a 10 dias habiles." },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4 p-4 bg-cream-dark/50">
                <span className="h-8 w-8 flex-shrink-0 flex items-center justify-center bg-rust text-cream font-[family-name:var(--font-oswald)] text-sm font-bold">
                  {item.step}
                </span>
                <p className="font-[family-name:var(--font-oswald)] text-sm text-charcoal/70 pt-1">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="card-retro p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle size={20} className="text-rust" />
            <h2 className="font-[family-name:var(--font-oswald)] text-lg uppercase tracking-[0.05em] text-charcoal">
              Necesitas ayuda?
            </h2>
          </div>
          <p className="font-[family-name:var(--font-oswald)] text-sm text-charcoal/60">
            Escribinos por WhatsApp o al email{" "}
            <a href="mailto:info@laloya.com" className="text-rust underline">
              info@laloya.com
            </a>{" "}
            y te asistimos con tu devolucion o cambio.
          </p>
        </div>
      </div>
    </div>
  )
}
