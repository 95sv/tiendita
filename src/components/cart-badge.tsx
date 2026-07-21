"use client"

import { useCartStore } from "@/store/cart"
import { useEffect, useState } from "react"

export function CartBadge() {
  const [mounted, setMounted] = useState(false)
  const itemCount = useCartStore((s) => s.getItemCount())

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rust text-[10px] font-bold text-cream font-[family-name:var(--font-libre)]">
      {itemCount}
    </span>
  )
}
