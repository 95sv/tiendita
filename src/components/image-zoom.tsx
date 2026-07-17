"use client"

import Image from "next/image"
import { useRef, useState, type MouseEvent } from "react"

interface ImageZoomProps {
  src: string
  alt: string
  sizes?: string
  priority?: boolean
  zoomScale?: number
}

export function ImageZoom({
  src,
  alt,
  sizes,
  priority,
  zoomScale = 2.2,
}: ImageZoomProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [origin, setOrigin] = useState("50% 50%")

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin(`${x}% ${y}%`)
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full cursor-zoom-in overflow-hidden"
      onMouseEnter={() => setIsZoomed(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsZoomed(false)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-300 ease-out"
        style={{
          transformOrigin: origin,
          transform: isZoomed ? `scale(${zoomScale})` : "scale(1)",
        }}
      />
    </div>
  )
}
