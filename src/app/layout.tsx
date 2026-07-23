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
  icons: {
    icon: ["/logo-rust.png", "/logo-rust.png"],
    shortcut: "/logo-rust.png",
  },
  openGraph: {
    title: "La Loya — Ropa & Café",
    description: "Ropa de diseño y café de especialidad. Estilo retro, calidad premium. Bahía Blanca.",
    url: "https://laloya.vercel.app",
    siteName: "La Loya",
    images: [
      {
        url: "/logo-cropped.png",
        width: 512,
        height: 512,
        alt: "La Loya",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "La Loya — Ropa & Café",
    description: "Ropa de diseño y café de especialidad. Estilo retro, calidad premium. Bahía Blanca.",
    images: ["/logo-cropped.png"],
  },
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
