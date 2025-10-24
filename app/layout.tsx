import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gel nails - gelmanicure Premium Press-On Nails",
  description:
    "Gel nails by gelmanicure - Discover salon-quality press-on nails with gel-like finish. Shop our collection of elegant, easy-to-apply nail designs. Free worldwide shipping on all orders.",
  keywords: [
    "gel nails",
    "gel manicure",
    "press-on nails",
    "fake nails",
    "artificial nails",
    "nail art",
    "manicure",
    "gelmanicure",
    "luxury nails",
    "reusable nails",
    "gel nail polish",
    "gel press-on nails",
  ],
  openGraph: {
    title: "Gel nails - gelmanicure Premium Press-On Nails",
    description: "Gel nails with salon-quality press-on nails delivered to your door. Easy application, stunning gel-like results.",
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
