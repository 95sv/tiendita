import type { Product } from "@/types"

export const products: Product[] = [
  {
    id: "1",
    name: "Camisa Oversized Oxford",
    description: "Camisa de oxford con corte oversized. Tejido de algodón 100% premium.",
    price: 28900,
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=600&h=800&fit=crop",
    ],
    category: "hombres",
    subcategory: "camisas",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Blanco", hex: "#FFFFFF" },
      { name: "Azul", hex: "#1E3A5F" },
    ],
    slug: "camisa-oversized-oxford",
    isNew: true,
  },
  {
    id: "2",
    name: "Jean Straight Cut",
    description: "Jean de corte recto con lavado medium. Algodón elástico para mayor comodidad.",
    price: 35900,
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop",
    ],
    category: "hombres",
    subcategory: "pantalones",
    sizes: ["28", "30", "32", "34", "36"],
    colors: [
      { name: "Azul Medium", hex: "#4A6FA5" },
      { name: "Azul Oscuro", hex: "#1B2838" },
    ],
    slug: "jean-straight-cut",
  },
  {
    id: "3",
    name: "Remera Básica Premium",
    description: "Remera de algodón peinado 220g. Corte regular fit.",
    price: 14900,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=800&fit=crop",
    ],
    category: "hombres",
    subcategory: "remeras",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Negro", hex: "#000000" },
      { name: "Blanco", hex: "#FFFFFF" },
      { name: "Gris", hex: "#808080" },
    ],
    slug: "remera-basica-premium",
  },
  {
    id: "4",
    name: "Buzo Hoodie Premium",
    description: "Buzo con capucha de french terry. Corte relajado con bolsillo canguro.",
    price: 42900,
    originalPrice: 52900,
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1578768079470-29b00bf3e183?w=600&h=800&fit=crop",
    ],
    category: "hombres",
    subcategory: "buzos",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Negro", hex: "#000000" },
      { name: "Gris Jaspeado", hex: "#9E9E9E" },
    ],
    slug: "buzo-hoodie-premium",
    discount: 19,
  },
  {
    id: "5",
    name: "Campera Bomber",
    description: "Campera tipo bomber con forro interior. Cierre frontal y bolsillos laterales.",
    price: 65900,
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=800&fit=crop",
    ],
    category: "hombres",
    subcategory: "camperas",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Negro", hex: "#000000" },
      { name: "Verde Militar", hex: "#4B5320" },
    ],
    slug: "campera-bomber",
    isNew: true,
  },
  {
    id: "6",
    name: "Remera Cargo",
    description: "Remera con bolsillos cargo en el pecho. Algodón durable.",
    price: 19900,
    images: [
      "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1622445275576-72430ca30fad?w=600&h=800&fit=crop",
    ],
    category: "hombres",
    subcategory: "remeras",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Khaki", hex: "#C3B091" },
      { name: "Negro", hex: "#000000" },
    ],
    slug: "remera-cargo",
  },
  {
    id: "7",
    name: "Pollera Midi Plisada",
    description: "Pollera midi con pliegues. Tela fluida conforast.",
    price: 27900,
    images: [
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop",
    ],
    category: "mujeres",
    subcategory: "polleras",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Negro", hex: "#000000" },
      { name: "Beige", hex: "#F5F5DC" },
    ],
    slug: "pollera-midi-plisada",
    isNew: true,
  },
  {
    id: "8",
    name: "Top Cropped Algodón",
    description: "Top cropped de algodón con tirantes ajustables.",
    price: 12900,
    images: [
      "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&h=800&fit=crop",
    ],
    category: "mujeres",
    subcategory: "remeras",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Blanco", hex: "#FFFFFF" },
      { name: "Rosa", hex: "#FFB6C1" },
      { name: "Negro", hex: "#000000" },
    ],
    slug: "top-cropped-algodon",
  },
  {
    id: "9",
    name: "Vestido Largo Minimalista",
    description: "Vestido largo con corte recto. Tela liviana perfecta para verano.",
    price: 38900,
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop",
    ],
    category: "mujeres",
    subcategory: "vestidos",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Negro", hex: "#000000" },
      { name: "Blanco", hex: "#FFFFFF" },
    ],
    slug: "vestido-largo-minimalista",
  },
  {
    id: "10",
    name: "Jean Mom High Rise",
    description: "Jean mom de tiro alto con lavado claro. Corte relajado.",
    price: 33900,
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop",
    ],
    category: "mujeres",
    subcategory: "pantalones",
    sizes: ["24", "26", "28", "30", "32"],
    colors: [
      { name: "Azul Claro", hex: "#87CEEB" },
      { name: "Azul Medium", hex: "#4A6FA5" },
    ],
    slug: "jean-mom-high-rise",
  },
  {
    id: "11",
    name: "Blusa Sedosa",
    description: "Blusa de seda sintética con cuello redondo. Elegante y versátil.",
    price: 24900,
    originalPrice: 31900,
    images: [
      "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600&h=800&fit=crop",
    ],
    category: "mujeres",
    subcategory: "remeras",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Crema", hex: "#FFFDD0" },
      { name: "Negro", hex: "#000000" },
    ],
    slug: "blusa-sedosa",
    discount: 22,
  },
  {
    id: "12",
    name: "Campera Denim Oversized",
    description: "Campera de denim oversized con desgaste natural.",
    price: 49900,
    images: [
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop",
    ],
    category: "mujeres",
    subcategory: "camperas",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Azul", hex: "#4A6FA5" },
      { name: "Azul Claro", hex: "#87CEEB" },
    ],
    slug: "campera-denim-oversized",
    isNew: true,
  },
  {
    id: "13",
    name: "Short Deportivo",
    description: "Short deportivo con cintura elástica. Tela técnica transpirable.",
    price: 16900,
    originalPrice: 21900,
    images: [
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1562895231-001762ea4a86?w=600&h=800&fit=crop",
    ],
    category: "ofertas",
    subcategory: "shorts",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Negro", hex: "#000000" },
      { name: "Gris", hex: "#808080" },
    ],
    slug: "short-deportivo",
    discount: 23,
  },
  {
    id: "14",
    name: "Buzo Full Zip",
    description: "Buzo con cierre completo. French terry de algodón.",
    price: 36900,
    originalPrice: 46900,
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop",
    ],
    category: "ofertas",
    subcategory: "buzos",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Negro", hex: "#000000" },
      { name: "Azul Marino", hex: "#000080" },
    ],
    slug: "buzo-full-zip",
    discount: 21,
  },
  {
    id: "15",
    name: "Pantalón Cargo Lino",
    description: "Pantalón cargo de lino con bolsillos laterales.",
    price: 29900,
    originalPrice: 39900,
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=800&fit=crop",
    ],
    category: "ofertas",
    subcategory: "pantalones",
    sizes: ["28", "30", "32", "34"],
    colors: [
      { name: "Beige", hex: "#F5F5DC" },
      { name: "Verde Oliva", hex: "#556B2F" },
    ],
    slug: "pantalon-cargo-lino",
    discount: 25,
  },
  {
    id: "16",
    name: "Remera Oversized 2-Pack",
    description: "Pack de 2 remeras oversized. Algodón peinado 200g.",
    price: 19900,
    originalPrice: 29800,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop",
    ],
    category: "ofertas",
    subcategory: "remeras",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Negro/Blanco", hex: "#000000" },
      { name: "Gris/Blanco", hex: "#808080" },
    ],
    slug: "remera-oversized-2pack",
    discount: 33,
  },
  {
    id: "17",
    name: "Vestido Camisero",
    description: "Vestido camisero con cintura marcada. Algodón lavado.",
    price: 34900,
    originalPrice: 44900,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop",
    ],
    category: "ofertas",
    subcategory: "vestidos",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Azul", hex: "#4A6FA5" },
      { name: "Blanco", hex: "#FFFFFF" },
    ],
    slug: "vestido-camisero",
    discount: 22,
  },
  {
    id: "18",
    name: "Chomba Piqué",
    description: "Chomba de piqué con cuello redondo. Tela premium.",
    price: 26900,
    images: [
      "https://images.unsplash.com/photo-1625910513413-5fc42ffe9cc0?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=800&fit=crop",
    ],
    category: "hombres",
    subcategory: "remeras",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Blanco", hex: "#FFFFFF" },
      { name: "Verde", hex: "#228B22" },
    ],
    slug: "chomba-pique",
  },
  {
    id: "19",
    name: "Bermuda Lino",
    description: "Bermuda de lino con cintura elástica. Perfecta para verano.",
    price: 22900,
    images: [
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1562895231-001762ea4a86?w=600&h=800&fit=crop",
    ],
    category: "hombres",
    subcategory: "shorts",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Beige", hex: "#F5F5DC" },
      { name: "Azul", hex: "#4A6FA5" },
    ],
    slug: "bermuda-lino",
  },
  {
    id: "20",
    name: "Conjunto Jogger + Top",
    description: "Conjunto de jogger y top ajustado. Tela suave con stretch.",
    price: 28900,
    originalPrice: 36900,
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=800&fit=crop",
    ],
    category: "mujeres",
    subcategory: "conjuntos",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Negro", hex: "#000000" },
      { name: "Gris", hex: "#808080" },
    ],
    slug: "conjunto-jogger-top",
    discount: 22,
  },
]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category)
}

export function getSaleProducts(): Product[] {
  return products.filter((p) => p.discount && p.discount > 0)
}

export function getNewProducts(): Product[] {
  return products.filter((p) => p.isNew)
}
