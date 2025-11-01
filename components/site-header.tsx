"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ShoppingBag, Search, User, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/store/cart-store"
import { useAuthStore } from "@/lib/store/auth-store"
import type { ProductCategory } from "@/types"
import { sortProductCategories } from "@/lib/utils/categories"

const createSlug = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

type NavigationDropdownItem = {
  name: string
  href: string
}

type NavigationItem = {
  name: string
  href: string
  dropdownItems?: NavigationDropdownItem[]
}

const FALLBACK_CATEGORIES: NavigationDropdownItem[] = [
  { name: "Classic", href: "/products?category=classic" },
  { name: "French", href: "/products?category=french" },
  { name: "Glitter", href: "/products?category=glitter" },
  { name: "Ombre", href: "/products?category=ombre" },
  { name: "Chrome", href: "/products?category=chrome" },
  { name: "Matte", href: "/products?category=matte" },
]

export function SiteHeader() {
  const itemCount = useCartStore((state) => state.getItemCount())
  const initializeCart = useCartStore((state) => state.init)
  const initAuth = useAuthStore((state) => state.init)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [catalogCategories, setCatalogCategories] = useState<NavigationDropdownItem[]>([])
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelScheduledClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const scheduleClose = () => {
    cancelScheduledClose()
    closeTimerRef.current = setTimeout(() => {
      setOpenDropdown(null)
    }, 150)
  }

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

        const response = await fetch("/api/categories", { cache: "no-store" })
        if (!response.ok) {
          throw new Error("Failed to load categories")
        }

        const data = await response.json()
        if (!active) return

        const rawCategories = Array.isArray(data.categories)
          ? (data.categories as ProductCategory[])
          : []

        const items = sortProductCategories(rawCategories)
          .filter((category) => category.name)
          .map((category) => {
            const baseline = (category.slug && category.slug.trim().length > 0
              ? category.slug
              : category.name) ?? ""
            const normalizedSlug = createSlug(baseline)
            const href = normalizedSlug.length > 0
              ? `/products?category=${encodeURIComponent(normalizedSlug)}`
              : `/products?q=${encodeURIComponent(baseline.trim())}`
            return {
              name: category.name,
              href,
            }
          })

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

  useEffect(() => {
    return () => {
      cancelScheduledClose()
    }
  }, [])

  const effectiveCatalogCategories =
    catalogCategories.length > 0 ? catalogCategories : FALLBACK_CATEGORIES

  const navigation: NavigationItem[] = [
    { name: "HOME", href: "/" },
    { name: "CATALOG", href: "/products", dropdownItems: effectiveCatalogCategories },
    { name: "HOW IT WORKS", href: "/how-it-works" },
    { name: "REVIEWS", href: "/reviews" },
    { name: "BLOG", href: "/blog" },
  ]

  const renderActions = (className: string) => (
    <div className={`flex items-center gap-1.5 md:gap-2 ${className}`}>
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
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-3 py-3 md:h-16 md:flex-row md:items-center md:justify-between md:py-0">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo-gelmanicure-nail.svg"
                alt="gelmanicure nail logo"
                width={160}
                height={64}
                priority
                className="h-10 w-auto md:h-12"
              />
              <span className="sr-only">gelmanicure-nail home</span>
            </Link>
            {renderActions("md:hidden")}
          </div>

          <nav className="order-last flex w-full flex-wrap items-center justify-center gap-3 text-sm font-medium text-muted-foreground md:order-none md:flex-1 md:justify-center">
            {navigation.map((item) => {
              if (!item.dropdownItems) {
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="rounded-md px-2 py-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {item.name}
                  </Link>
                )
              }

              const isOpen = openDropdown === item.name

              return (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => {
                    cancelScheduledClose()
                    setOpenDropdown(item.name)
                  }}
                  onMouseLeave={scheduleClose}
                >
                  <button
                    type="button"
                    onClick={() => setOpenDropdown((current) => (current === item.name ? null : item.name))}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {item.name}
                    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  <div
                    className={`absolute left-1/2 top-full z-40 mt-2 w-60 -translate-x-1/2 overflow-hidden rounded-lg border border-border/60 bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/90 ${
                      isOpen ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                    onMouseEnter={cancelScheduledClose}
                    onMouseLeave={scheduleClose}
                  >
                    <div className="flex flex-col py-2">
                      <Link
                        href={item.href}
                        className="px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60"
                        onClick={() => setOpenDropdown(null)}
                      >
                        All Products
                      </Link>
                      <div className="grid gap-1 px-2 py-1 sm:grid-cols-2">
                        {catalogLoading && (
                          <span className="px-2 py-2 text-sm text-muted-foreground">Loading categories…</span>
                        )}
                        {catalogError && (
                          <span className="px-2 py-2 text-sm font-semibold text-destructive">{catalogError}</span>
                        )}
                        {item.dropdownItems?.map((dropdown) => (
                          <Link
                            key={dropdown.name}
                            href={dropdown.href}
                            className="rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                            onClick={() => setOpenDropdown(null)}
                          >
                            {dropdown.name}
                          </Link>
                        ))}
                        {!catalogLoading && !catalogError && item.dropdownItems?.length === 0 && (
                          <span className="px-2 py-2 text-sm text-muted-foreground">Categories coming soon.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </nav>

          {renderActions("hidden md:flex")}
        </div>
      </div>
    </header>
  )
}
