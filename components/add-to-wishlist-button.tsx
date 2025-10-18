'use client'

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Heart, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store/auth-store"

interface AddToWishlistButtonProps {
  productId: string
}

export function AddToWishlistButton({ productId }: AddToWishlistButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const initAuth = useAuthStore((state) => state.init)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const authInitialized = useAuthStore((state) => state.initialized)

  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initAuth().catch(() => undefined)
  }, [initAuth])

  useEffect(() => {
    if (!authInitialized || !isAuthenticated) return

    const checkWishlist = async () => {
      try {
        const response = await fetch("/api/account/wishlist")
        if (!response.ok) return
        const data = (await response.json()) as { items: Array<{ productId: string }> }
        setIsSaved(data.items.some((item) => item.productId === productId))
      } catch {
        // ignore background errors
      }
    }

    checkWishlist()
  }, [authInitialized, isAuthenticated, productId])

  const handleClick = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname ?? "/")}`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/account/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(typeof payload?.message === "string" ? payload.message : "Unable to update wishlist.")
      }

      setIsSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update wishlist.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant={isSaved ? "default" : "outline"}
        className={isSaved ? "bg-primary text-primary-foreground" : "bg-transparent"}
        onClick={handleClick}
        disabled={loading}
      >
        {isSaved ? <Check className="mr-2 h-4 w-4" /> : <Heart className="mr-2 h-4 w-4" />}
        {isSaved ? "Saved to wishlist" : "Add to wishlist"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
