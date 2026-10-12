import { hexForColor } from "@/lib/colors"
import { sortSizes } from "@/lib/utils"

interface StockBreakdownProps {
  variants: { id: string; size: string; color: string; stock: number }[]
}

export function StockBreakdown({ variants }: StockBreakdownProps) {
  if (variants.length === 0) {
    return (
      <span className="text-[10px] text-charcoal/30 font-[family-name:var(--font-libre)] uppercase">
        Sin variantes
      </span>
    )
  }

  const colors = [...new Set(variants.map((v) => v.color))]
  const sizes = sortSizes([...new Set(variants.map((v) => v.size))])
  const showColor = colors.length > 1 || colors[0] !== "Único"

  return (
    <div className="space-y-1.5">
      {colors.map((color) => (
        <div key={color} className="flex items-center gap-2">
          {showColor && (
            <span className="inline-flex w-20 flex-shrink-0 items-center gap-1.5 font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-wider text-charcoal/60">
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full border border-charcoal/20"
                style={{ backgroundColor: hexForColor(color) }}
              />
              <span className="truncate">{color}</span>
            </span>
          )}
          <div className="flex flex-wrap gap-1">
            {sizes.map((size) => {
              const variant = variants.find((v) => v.color === color && v.size === size)
              if (!variant) return null
              return (
                <span
                  key={size}
                  className={`inline-flex items-center gap-1 border px-1.5 py-0.5 font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-wider ${
                    variant.stock <= 0
                      ? "border-red-200 bg-red-50 text-red-600"
                      : "border-charcoal/15 text-charcoal/50"
                  }`}
                >
                  {size}
                  <span className={variant.stock <= 0 ? "font-bold" : "font-bold text-charcoal"}>
                    {variant.stock}
                  </span>
                </span>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
