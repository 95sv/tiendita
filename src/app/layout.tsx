import type { Metadata } from "next"
import { Pacifico, Oswald, Playfair_Display } from "next/font/google"
import "./globals.css"
import { ClientLayout } from "@/components/client-layout"

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pacifico",
})

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "La Loya — Ropa & Café",
  description: "Ropa de diseño y café de especialidad. Estilo retro, calidad premium. Bahía Blanca.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${pacifico.variable} ${oswald.variable} ${playfair.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
