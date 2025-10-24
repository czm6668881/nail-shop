"use client"

import { type FocusEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ShoppingBag, Search, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/store/cart-store"
import { useAuthStore } from "@/lib/store/auth-store"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import type { ProductCategory } from "@/types"
import { sortProductCategories } from "@/lib/utils/categories"

type NavigationDropdownItem = {
  name: string
  href: string
}

type NavigationItem = {
  name: string
  href: string
  dropdownItems?: NavigationDropdownItem[]
}

export function SiteHeader() {
  const itemCount = useCartStore((state) => state.getItemCount())
  const initializeCart = useCartStore((state) => state.init)
  const initAuth = useAuthStore((state) => state.init)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [catalogCategories, setCatalogCategories] = useState<NavigationDropdownItem[]>([])
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [catalogError, setCatalogError] = useState<string | null>(null)

  useEffect(() => {
    initializeCart().catch(() => undefined)
    initAuth().catch(() => undefined)
  }, [initializeCart, initAuth])

  useEffect(() => {
    let active = true

    const loadCategories = async () => {
      try {
        setCatalogLoading(true)
        setCatalogError(null)

        const response = await fetch("/api/categories")
        if (!response.ok) {
          throw new Error("Failed to load categories")
        }

        const data = await response.json()
        if (!active) return

        const rawCategories = Array.isArray(data.categories)
          ? (data.categories as ProductCategory[])
          : []

        const items = sortProductCategories(rawCategories)
          .filter((category) => category.slug && category.name)
          .map((category) => ({
            name: category.name,
            href: `/products?category=${encodeURIComponent(category.slug)}`,
          }))

        setCatalogCategories(items)
        setCatalogLoading(false)
      } catch (error) {
        console.error("Failed to load categories", error)
        if (!active) return

        setCatalogCategories([])
        setCatalogError("Unable to load categories right now.")
        setCatalogLoading(false)
      }
    }

    loadCategories()

    return () => {
      active = false
    }
  }, [])

  const catalogColumns = useMemo(() => {
    if (catalogCategories.length === 0) {
      return []
    }

    const columnCount = Math.min(3, Math.max(1, Math.ceil(catalogCategories.length / 4)))
    const chunkSize = Math.ceil(catalogCategories.length / columnCount)

    return Array.from({ length: columnCount }, (_, columnIndex) =>
      catalogCategories.slice(columnIndex * chunkSize, (columnIndex + 1) * chunkSize),
    )
  }, [catalogCategories])

  const catalogGridClass =
    catalogColumns.length === 3
      ? "grid-cols-3"
      : catalogColumns.length === 2
        ? "grid-cols-2"
        : "grid-cols-1"

  const navigation: NavigationItem[] = [
    { name: "HOME", href: "/" },
    { name: "CATALOG", href: "/collections", dropdownItems: catalogCategories },
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
                    {item.name === "CATALOG" ? (
                      <div className="ml-4 flex flex-col gap-2">
                        {catalogLoading && (
                          <span className="text-sm text-muted-foreground">Loading categories…</span>
                        )}
                        {!catalogLoading && catalogError && (
                          <span className="text-sm font-medium text-destructive">{catalogError}</span>
                        )}
                        {!catalogLoading && !catalogError && item.dropdownItems && item.dropdownItems.length > 0 && (
                          item.dropdownItems.map((dropdown) => (
                            <Link
                              key={dropdown.name}
                              href={dropdown.href}
                              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                              {dropdown.name}
                            </Link>
                          ))
                        )}
                        {!catalogLoading && !catalogError && item.dropdownItems && item.dropdownItems.length === 0 && (
                          <span className="text-sm text-muted-foreground">Categories coming soon.</span>
                        )}
                        <Link
                          href="/collections"
                          className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                        >
                          View full catalog
                        </Link>
                      </div>
                    ) : (
                      item.dropdownItems && (
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
                      )
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

              const isCatalog = item.name === "CATALOG"

              return (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.name)}
                  onMouseLeave={() => setOpenDropdown(null)}
                  onFocusCapture={() => setOpenDropdown(item.name)}
                  onBlurCapture={(event: FocusEvent<HTMLDivElement>) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      setOpenDropdown(null)
                    }
                  }}
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
                    className={`absolute left-1/2 top-full z-40 w-72 -translate-x-1/2 pt-3 transition-transform transition-opacity duration-200 ease-out ${
                      openDropdown === item.name
                        ? "translate-y-0 opacity-100 pointer-events-auto"
                        : "-translate-y-2 opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="overflow-hidden rounded-lg border border-border/60 bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/90">
                      {isCatalog ? (
                        <div className="px-4 py-3">
                          {catalogLoading && (
                            <p className="text-sm text-muted-foreground">Loading categories…</p>
                          )}
                          {!catalogLoading && catalogError && (
                            <p className="text-sm font-semibold text-destructive">{catalogError}</p>
                          )}
                          {!catalogLoading && !catalogError && catalogColumns.length > 0 && (
                            <div className={`grid gap-y-1 gap-x-4 ${catalogGridClass}`}>
                              {catalogColumns.map((column, columnIndex) => (
                                <div key={`catalog-column-${columnIndex}`} className="flex flex-col gap-1">
                                  {column.map((dropdown) => (
                                    <Link
                                      key={dropdown.name}
                                      href={dropdown.href}
                                      className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                                    >
                                      {dropdown.name}
                                    </Link>
                                  ))}
                                </div>
                              ))}
                            </div>
                          )}
                          {!catalogLoading && !catalogError && catalogColumns.length === 0 && (
                            <p className="text-sm text-muted-foreground">Categories coming soon.</p>
                          )}
                          <div className="mt-3 border-t border-border/60 pt-3">
                            <Link
                              href="/collections"
                              className="block text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                            >
                              View full catalog
                            </Link>
                          </div>
                        </div>
                      ) : (
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
                      )}
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
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
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
