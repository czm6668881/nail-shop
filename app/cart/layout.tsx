import type { Metadata } from "next"
import type { ReactNode } from "react"
import { siteConfig } from "@/lib/config/site"

export const metadata: Metadata = {
  title: `Your Cart | ${siteConfig.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default function CartLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
