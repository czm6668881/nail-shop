import type { Metadata } from "next"
import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth/session"
import { AdminShell } from "@/components/admin/admin-shell"
import { siteConfig } from "@/lib/config/site"

interface AdminLayoutProps {
  children: ReactNode
}

export const metadata: Metadata = {
  title: `Admin | ${siteConfig.name}`,
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getSessionUser()

  if (!user || user.role !== "admin") {
    redirect("/login?redirect=/admin")
  }

  return <AdminShell>{children}</AdminShell>
}
