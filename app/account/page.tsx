"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth-store"
import { Button } from "@/components/ui/button"
import { User, Package, MapPin, Heart, Settings, LogOut } from "lucide-react"
import Link from "next/link"

export default function AccountPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const initAuth = useAuthStore((state) => state.init)
  const authInitialized = useAuthStore((state) => state.initialized)

  useEffect(() => {
    initAuth().catch(() => undefined)
  }, [initAuth])

  useEffect(() => {
    if (!authInitialized) return
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [authInitialized, isAuthenticated, router])

  if (!authInitialized || !isAuthenticated || !user) {
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const menuItems = [
    {
      icon: User,
      label: "Profile",
      href: "/account/profile",
      description: "Manage your personal information",
    },
    {
      icon: Package,
      label: "Orders",
      href: "/account/orders",
      description: "View your order history and track shipments",
    },
    {
      icon: MapPin,
      label: "Addresses",
      href: "/account/addresses",
      description: "Manage your shipping addresses",
    },
    {
      icon: Heart,
      label: "Wishlist",
      href: "/account/wishlist",
      description: "Save your favorite products",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/account/settings",
      description: "Update your account preferences",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Account</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.firstName} {user.lastName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors group"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Button variant="outline" onClick={handleLogout} className="bg-transparent">
          <LogOut className="mr-2 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
