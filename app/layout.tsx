import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { siteConfig, toAbsoluteUrl } from "@/lib/config/site"

const inter = Inter({ subsets: ["latin"] })

const DEFAULT_OG_IMAGE = toAbsoluteUrl(siteConfig.defaultOgImagePath)

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `Gel Nails & Premium Press-On Nails | ${siteConfig.name}`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "Discover gelmanicure's salon-quality gel press-on nails and wearable nail art. Shop reusable gel tips, chic designs, and custom sets with fast worldwide shipping.",
  openGraph: {
    title: `Gel Nails & Premium Press-On Nails | ${siteConfig.name}`,
    description:
      "Salon-quality gel press-on nails by gelmanicure. Explore reusable styles, fast application tips, and worldwide delivery.",
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "gelmanicure premium gel press-on nails hero image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Gel Nails & Premium Press-On Nails | ${siteConfig.name}`,
    description:
      "Shop reusable gel press-on nails, custom sets, and pro nail care essentials from gelmanicure.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: siteConfig.url,
  },
  generator: "v0.app",
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
