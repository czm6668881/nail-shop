import type { Metadata } from "next"
import type { ReactNode } from "react"
import { siteConfig } from "@/lib/config/site"

export const metadata: Metadata = {
  title: `Create Account | ${siteConfig.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
