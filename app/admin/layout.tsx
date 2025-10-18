import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth/session"
import { AdminShell } from "@/components/admin/admin-shell"

interface AdminLayoutProps {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getSessionUser()

  if (!user || user.role !== "admin") {
    redirect("/login?redirect=/admin")
  }

  return <AdminShell>{children}</AdminShell>
}
