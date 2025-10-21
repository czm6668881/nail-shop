"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, ShoppingCart, Users, Star, LayoutDashboard, FileText, FolderOpen, Image } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Hero Slides", href: "/admin/hero-slides", icon: Image },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Blog", href: "/admin/blog", icon: FileText },
  { name: "Collections", href: "/admin/collections", icon: FolderOpen },
]

interface AdminShellProps {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-card border-r border-border">
          <div className="p-6">
            <Link href="/admin" className="text-xl font-bold">
              Admin Panel
            </Link>
          </div>
          <nav className="px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1">
          <div className="container mx-auto px-4 py-12">{children}</div>
        </main>
      </div>
    </div>
  )
}
