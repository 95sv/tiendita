import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"]

export function sortSizes(sizes: string[]): string[] {
  const rank = (size: string) => {
    const index = SIZE_ORDER.indexOf(size.trim().toUpperCase())
    return index === -1 ? SIZE_ORDER.length : index
  }
  return [...sizes].sort(
    (a, b) => rank(a) - rank(b) || a.localeCompare(b, "es", { numeric: true })
  )
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(price)
}
