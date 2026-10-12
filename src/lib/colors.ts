import type { Color } from "@/types"

export const COLOR_PALETTE: Color[] = [
  { name: "Blanco",   hex: "#FFFFFF" },
  { name: "Negro",    hex: "#000000" },
  { name: "Gris",     hex: "#808080" },
  { name: "Azul",     hex: "#1E3A5F" },
  { name: "Rojo",     hex: "#B91C1C" },
  { name: "Verde",    hex: "#166534" },
  { name: "Amarillo", hex: "#EAB308" },
  { name: "Marrón",   hex: "#78350F" },
  { name: "Rosa",     hex: "#EC4899" },
  { name: "Naranja",  hex: "#EA580C" },
  { name: "Beige",    hex: "#D4C5A9" },
  { name: "Bordó",    hex: "#7F1D1D" },
]

export function hexForColor(name: string): string {
  const found = COLOR_PALETTE.find((c) => c.name.toLowerCase() === name.toLowerCase())
  return found?.hex || "#000000"
}

export const UNIQUE_COLOR: Color = { name: "Único", hex: "#000000" }
