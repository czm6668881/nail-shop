"use client"

import { useEffect, useState } from "react"
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
import type { Collection } from "@/types"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const itemCount = useCartStore((state) => state.getItemCount())
  const initializeCart = useCartStore((state) => state.init)
  const initAuth = useAuthStore((state) => state.init)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    initializeCart().catch(() => undefined)
    initAuth().catch(() => undefined)
    
    // 加载集合数据
    fetch("/api/collections")
      .then((res) => res.json())
      .then((data) => setCollections(data))
      .catch(() => undefined)
  }, [initializeCart, initAuth])

  const navigation = [
    { name: "Home", href: "/" },
    { name: "New Arrivals", href: "/products?filter=new" },
    { name: "Best Sellers", href: "/products?filter=bestsellers" },
    { name: "Reviews", href: "/reviews" },
    { name: "Blog", href: "/blog" },
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
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="/"
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  Home
                </Link>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/collections"
                    className="text-lg font-medium hover:text-primary transition-colors"
                  >
                    CATALOG
                  </Link>
                  {collections.length > 0 && (
                    <div className="ml-4 flex flex-col gap-2">
                      {collections.map((collection) => (
                        <Link
                          key={collection.id}
                          href={`/collections/${collection.slug}`}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {collection.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                {navigation.map((item) => (
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
            <span className="text-2xl font-bold tracking-tight">gelmanicure-nail</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            
            {/* CATALOG with dropdown */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-auto bg-transparent px-0 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-foreground">
                    CATALOG
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            href="/collections"
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          >
                            <div className="mb-2 mt-4 text-lg font-medium">
                              所有类目
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              浏览我们完整的美甲系列
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      {collections.map((collection) => (
                        <li key={collection.id}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={`/collections/${collection.slug}`}
                              className={cn(
                                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              )}
                            >
                              <div className="text-sm font-medium leading-none">
                                {collection.name}
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {collection.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {navigation.map((item) => (
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
