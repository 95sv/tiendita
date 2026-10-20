"use client"

import { formatPrice } from "@/lib/utils"

const QUICK_DISCOUNTS = [10, 15, 20, 25, 30, 40, 50]

export function discountPercent(listPrice: number, salePrice: number): number {
  return Math.round(((listPrice - salePrice) / listPrice) * 100)
}

// Devuelve el mensaje de error, o null si los precios son válidos
export function priceError(listPrice: string, salePrice: string): string | null {
  const list = Number(listPrice)
  if (!listPrice || !(list > 0)) return "Ingresá el precio de lista"
  if (!salePrice) return null
  const sale = Number(salePrice)
  if (!(sale > 0)) return "El precio con descuento tiene que ser mayor a 0"
  if (sale >= list) return "El precio con descuento tiene que ser menor al de lista"
  return null
}

// Traduce los dos campos al modelo del panel: price es lo que paga el cliente
// y originalPrice el precio tachado (solo si hay descuento)
export function pricesFromFields(listPrice: string, salePrice: string) {
  const list = Number(listPrice)
  const sale = salePrice ? Number(salePrice) : null
  return sale !== null && sale > 0 && sale < list
    ? { price: sale, originalPrice: list as number | undefined, discount: discountPercent(list, sale) as number | undefined }
    : { price: list, originalPrice: undefined, discount: undefined }
}

interface PriceFieldsProps {
  listPrice: string
  salePrice: string
  onChange: (next: { listPrice: string; salePrice: string }) => void
}

const labelClass =
  "font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50"

export function PriceFields({ listPrice, salePrice, onChange }: PriceFieldsProps) {
  const list = Number(listPrice)
  const sale = Number(salePrice)
  const error = salePrice ? priceError(listPrice, salePrice) : null
  const percent = salePrice && !error ? discountPercent(list, sale) : null

  const applyPercent = (p: number) => {
    if (list > 0 && p > 0 && p < 100) {
      onChange({ listPrice, salePrice: String(Math.round(list * (1 - p / 100))) })
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Precio de lista ($) *</label>
          <input
            type="number"
            value={listPrice}
            onChange={(e) => onChange({ listPrice: e.target.value, salePrice })}
            className="input-retro w-full px-4 py-3 text-sm mt-2"
            placeholder="0"
            min="0"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Precio con descuento ($)</label>
          <input
            type="number"
            value={salePrice}
            onChange={(e) => onChange({ listPrice, salePrice: e.target.value })}
            className="input-retro w-full px-4 py-3 text-sm mt-2"
            placeholder="Sin descuento"
            min="0"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className={labelClass}>Aplicar descuento</span>
        {QUICK_DISCOUNTS.map((p) => (
          <button
            key={p}
            type="button"
            disabled={!(list > 0)}
            onClick={() => applyPercent(p)}
            className={`px-2.5 py-1 text-xs font-[family-name:var(--font-libre)] border transition-all disabled:opacity-30 ${
              percent === p
                ? "border-rust bg-rust/10 text-charcoal"
                : "border-charcoal/20 text-charcoal/60 hover:border-charcoal/40"
            }`}
          >
            {p}%
          </button>
        ))}
        <input
          type="number"
          min="1"
          max="90"
          placeholder="Otro %"
          disabled={!(list > 0)}
          onChange={(e) => applyPercent(Number(e.target.value))}
          className="input-retro w-20 px-2 py-1 text-xs disabled:opacity-30"
        />
        {salePrice && (
          <button
            type="button"
            onClick={() => onChange({ listPrice, salePrice: "" })}
            className="text-[10px] font-[family-name:var(--font-libre)] uppercase tracking-wider text-charcoal/40 hover:text-rust"
          >
            Quitar descuento
          </button>
        )}
      </div>

      {error ? (
        <p className="text-xs text-red-600 font-[family-name:var(--font-libre)] uppercase tracking-wider">
          {error}
        </p>
      ) : percent !== null ? (
        <p className="text-xs text-green-700 font-[family-name:var(--font-libre)] uppercase tracking-wider">
          {percent}% OFF · el cliente paga {formatPrice(sale)} en lugar de {formatPrice(list)}
        </p>
      ) : (
        <p className="text-xs text-charcoal/40 font-[family-name:var(--font-libre)] uppercase tracking-wider">
          Sin descuento
        </p>
      )}
    </div>
  )
}
