"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingBag, Search, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/store/cart-store"
import { useAuthStore } from "@/lib/store/auth-store"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CATEGORY_FILTERS } from "@/lib/config/product-filters"

type NavigationItem = {
  name: string
  href: string
  dropdownItems?: { name: string; href: string }[]
}

export function SiteHeader() {
  const itemCount = useCartStore((state) => state.getItemCount())
  const initializeCart = useCartStore((state) => state.init)
  const initAuth = useAuthStore((state) => state.init)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    initializeCart().catch(() => undefined)
    initAuth().catch(() => undefined)
  }, [initializeCart, initAuth])

  const categoryNavigation = CATEGORY_FILTERS.map((category) => ({
    name: category.label,
    href: `/products?category=${category.id}`,
  }))

  const navigation: NavigationItem[] = [
    { name: "HOME", href: "/" },
    { name: "CATALOG", href: "/collections", dropdownItems: categoryNavigation },
    { name: "REVIEWS", href: "/reviews" },
    { name: "BLOG", href: "/blog" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="mt-8 flex flex-col gap-4">
                {navigation.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <Link
                      href={item.href}
                      className="text-lg font-medium transition-colors hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    {item.dropdownItems && (
                      <div className="ml-4 flex flex-col gap-2">
                        {item.dropdownItems.map((dropdown) => (
                          <Link
                            key={dropdown.name}
                            href={dropdown.href}
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {dropdown.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight">gelmanicure-nail</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 lg:flex">
            {navigation.map((item) => {
              if (!item.dropdownItems) {
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                )
              }

              return (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.name)}
                  onMouseLeave={() => setOpenDropdown(null)}
                  onFocusCapture={() => setOpenDropdown(item.name)}
                  onBlurCapture={() => setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    aria-haspopup="true"
                    aria-expanded={openDropdown === item.name}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                  <div
                    className={`absolute left-1/2 top-full z-40 mt-3 w-56 -translate-x-1/2 transition-transform transition-opacity duration-200 ease-out ${
                      openDropdown === item.name
                        ? "translate-y-0 opacity-100 pointer-events-auto"
                        : "-translate-y-2 opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="overflow-hidden rounded-lg border border-border/60 bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/90">
                      <div className="flex flex-col py-2">
                        {item.dropdownItems.map((dropdown) => (
                          <Link
                            key={dropdown.name}
                            href={dropdown.href}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                          >
                            {dropdown.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/search">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={isAuthenticated ? "/account" : "/login"}>
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                    {itemCount}
                  </span>
                )}
                <span className="sr-only">Shopping cart</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
