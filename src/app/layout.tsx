import type { Metadata } from "next"
import { Cormorant_Garamond, Libre_Franklin } from "next/font/google"
import "./globals.css"
import { ClientLayout } from "@/components/client-layout"

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cormorant",
})

const libreFranklin = Libre_Franklin({
  subsets: ["latin"],
  variable: "--font-libre",
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
      className={`${cormorant.variable} ${libreFranklin.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
