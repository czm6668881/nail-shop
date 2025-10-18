import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "gelmanicure - Premium Press-On Nails",
  description:
    "Discover salon-quality press-on nails for the modern woman. Shop our collection of elegant, easy-to-apply nail designs. Free shipping on orders over $50.",
  keywords: [
    "press-on nails",
    "fake nails",
    "artificial nails",
    "nail art",
    "manicure",
    "gelmanicure",
    "luxury nails",
    "reusable nails",
  ],
  openGraph: {
    title: "gelmanicure - Premium Press-On Nails",
    description: "Salon-quality press-on nails delivered to your door. Easy application, stunning results.",
    type: "website",
    url: "https://gelmanicure-nail.com",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  )
}
