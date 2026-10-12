import { getAllProducts } from "@/lib/medusa-store"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/types"

export interface CheckoutLine {
  id: string
  name: string
  price: number
  quantity: number
  size: string
  color: string
  variant_id: string
}

type CheckoutResult = { lines: CheckoutLine[] } | { error: string; status: number }

// El backend en Render puede tardar cerca de un minuto en despertar
const CATALOG_TIMEOUT_MS = 45_000

// Arma las líneas del pedido con nombre, precio y stock tomados de Medusa.
// Del navegador solo se toma qué producto, talle, color y cantidad se pidió;
// si el catálogo no responde no se puede cobrar, porque no hay precio confiable.
export async function resolveCheckoutItems(items: unknown): Promise<CheckoutResult> {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "No items provided", status: 400 }
  }

  const products = await Promise.race([
    getAllProducts(),
    new Promise<Product[]>((resolve) => setTimeout(() => resolve([]), CATALOG_TIMEOUT_MS)),
  ])
  if (products.length === 0) {
    return {
      error: "No pudimos verificar tu pedido. Probá de nuevo en unos segundos.",
      status: 503,
    }
  }

  const lines: CheckoutLine[] = []
  for (const item of items) {
    const quantity = Number(item?.quantity)
    if (!Number.isInteger(quantity) || quantity < 1) {
      return { error: "Cantidad inválida", status: 400 }
    }

    const product = products.find((p) => p.id === item?.id)
    if (!product) {
      const label = typeof item?.name === "string" && item.name ? item.name : "Un producto"
      return {
        error: `${label} ya no está disponible. Quitalo del carrito para continuar.`,
        status: 409,
      }
    }

    const sameSize = product.variants?.filter((v) => v.size === item.size) || []
    const variant =
      product.variants?.find((v) => v.id === item.variant_id) ??
      sameSize.find((v) => v.color === (item.color || "Único")) ??
      (sameSize.length === 1 ? sameSize[0] : undefined)
    if (!variant) {
      return {
        error: `${product.name} no está disponible en ese talle o color.`,
        status: 409,
      }
    }

    if (typeof item.price === "number" && item.price !== product.price) {
      return {
        error: `El precio de ${product.name} cambió a ${formatPrice(product.price)}. Quitalo del carrito y volvé a agregarlo para continuar.`,
        status: 409,
      }
    }

    const existing = lines.find((line) => line.variant_id === variant.id)
    const wanted = quantity + (existing?.quantity || 0)
    if (variant.stock < wanted) {
      const detail = [`talle ${variant.size}`, variant.color !== "Único" ? variant.color : ""]
        .filter(Boolean)
        .join(", ")
      return {
        error:
          variant.stock > 0
            ? `Solo quedan ${variant.stock} de ${product.name} (${detail}).`
            : `${product.name} (${detail}) no tiene stock.`,
        status: 409,
      }
    }

    if (existing) {
      existing.quantity = wanted
    } else {
      lines.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        size: variant.size,
        color: variant.color,
        variant_id: variant.id,
      })
    }
  }

  return { lines }
}
