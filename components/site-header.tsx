"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ShoppingBag, Search, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/store/cart-store"
import { useAuthStore } from "@/lib/store/auth-store"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

export function SiteHeader() {
  const itemCount = useCartStore((state) => state.getItemCount())
  const initializeCart = useCartStore((state) => state.init)
  const initAuth = useAuthStore((state) => state.init)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    initializeCart().catch(() => undefined)
    initAuth().catch(() => undefined)
  }, [initializeCart, initAuth])

  const navigation = [
    { name: "Home", href: "/" },
    { name: "New Arrivals", href: "/products?filter=new" },
    { name: "Best Sellers", href: "/products?filter=bestsellers" },
    { name: "Reviews", href: "/reviews" },
    { name: "Blog", href: "/blog" },
  ]

  const collections = [
    {
      name: "Classics",
      href: "/collections/classics",
      description: "Timeless designs that never go out of style",
    },
    {
      name: "Metallics",
      href: "/collections/metallics",
      description: "Shine bright with our chrome and metallic finishes",
    },
    {
      name: "Night Out",
      href: "/collections/night-out",
      description: "Glamorous designs for special occasions",
    },
    {
      name: "Essentials",
      href: "/collections/essentials",
      description: "Everyday nails for every occasion",
    },
  ]

  const [homeNavItem, ...secondaryNavigation] = navigation

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
              <nav className="flex flex-col gap-4 mt-8">
                {homeNavItem && (
                  <Link
                    href={homeNavItem.href}
                    className="text-lg font-medium hover:text-primary transition-colors"
                  >
                    {homeNavItem.name}
                  </Link>
                )}
                <Link href="/collections" className="text-lg font-medium hover:text-primary transition-colors">
                  Collections
                </Link>
                {secondaryNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-lg font-medium hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight">gelmanicure</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {homeNavItem && (
              <Link
                href={homeNavItem.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {homeNavItem.name}
              </Link>
            )}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-transparent">
                    Collections
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[600px] gap-3 p-4 md:grid-cols-2">
                      {collections.map((collection) => (
                        <NavigationMenuLink key={collection.name} asChild>
                          <Link
                            href={collection.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{collection.name}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {collection.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {secondaryNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
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
