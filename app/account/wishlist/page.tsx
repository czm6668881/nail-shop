"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Heart, ShoppingBag, Trash2 } from "lucide-react"
import type { WishlistItem } from "@/types"
import { useAuthStore } from "@/lib/store/auth-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function WishlistPage() {
  const router = useRouter()
  const initAuth = useAuthStore((state) => state.init)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const authInitialized = useAuthStore((state) => state.initialized)
  const user = useAuthStore((state) => state.user)

  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initAuth().catch(() => undefined)
  }, [initAuth])

  useEffect(() => {
    if (!authInitialized) return
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const loadWishlist = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/account/wishlist")
        if (response.status === 401) {
          router.push("/login")
          return
        }
        if (!response.ok) {
          throw new Error("Unable to load wishlist.")
        }
        const data = (await response.json()) as { items: WishlistItem[] }
        setItems(data.items)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load wishlist.")
      } finally {
        setLoading(false)
      }
    }

    loadWishlist()
  }, [authInitialized, isAuthenticated, router])

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/account/wishlist/${itemId}`, { method: "DELETE" })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(typeof payload?.message === "string" ? payload.message : "Unable to remove item.")
      }
      setItems((state) => state.filter((item) => item.id !== itemId))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove item.")
    }
  }

  if (!authInitialized || (isAuthenticated && loading)) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold">Loading wishlist…</h1>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Link
            href="/account"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Account
          </Link>
          <h1 className="text-4xl font-bold mb-2">Wishlist</h1>
            <p className="text-muted-foreground">
            Save your favorite sets for later or move them into your cart when you are ready.
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
        )}

        {items.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto">
              <Heart className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold">No favorites yet</h2>
            <p className="text-sm text-muted-foreground">
              Tap the heart icon on any product to add it to your wishlist and revisit it anytime.
            </p>
            <Button asChild>
              <Link href="/products">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Shop new arrivals
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-lg overflow-hidden group flex flex-col">
                <Link href={`/products/${item.product.slug}`} className="relative aspect-square overflow-hidden">
                  <Image
                    src={item.product.images[0] || "/placeholder.svg"}
                    alt={item.product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {!item.product.inStock && (
                    <Badge className="absolute top-3 left-3 bg-muted text-muted-foreground">Out of Stock</Badge>
                  )}
                </Link>

                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div className="space-y-2">
                    <Link href={`/products/${item.product.slug}`} className="block font-semibold hover:text-primary">
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.product.description}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>${item.product.price.toFixed(2)}</span>
                    {item.product.compareAtPrice && (
                      <span className="text-muted-foreground line-through">
                        ${item.product.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-auto">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/products/${item.product.slug}`}>View details</Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove from wishlist</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
