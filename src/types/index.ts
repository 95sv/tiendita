export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: "hombres" | "mujeres" | "ofertas"
  collectionTitle?: string
  collectionHandle?: string
  subcategory?: string
  sizes: string[]
  colors: Color[]
  slug: string
  isNew?: boolean
  discount?: number
}

export interface Color {
  name: string
  hex: string
}

export interface CartItem {
  product: Product
  quantity: number
  size: string
  color: Color
}

export interface User {
  id: string
  email: string
  name: string
}
