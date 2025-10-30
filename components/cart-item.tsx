"use client"

import Image from "next/image"
import Link from "next/link"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/store/cart-store"
import type { CartItem as CartItemType } from "@/types"

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const loading = useCartStore((state) => state.loading)
  const formatLength = (value: number) => Number(value.toFixed(2)).toString()

  return (
    <div className="flex gap-4 bg-card rounded-lg p-4 border border-border">
      {/* Image */}
      <Link href={`/products/${item.product.slug}`} className="relative h-24 w-24 flex-shrink-0">
        <Image
          src={item.product.images[0] || "/placeholder.svg"}
          alt={item.product.name}
          fill
          className="object-cover rounded-md"
        />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.product.slug}`} className="hover:text-primary transition-colors">
          <h3 className="font-semibold mb-1 text-balance">{item.product.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-2">
          Size: {item.size}
          {typeof item.length === "number" && Number.isFinite(item.length) && (
            <span className="ml-2">Length: {formatLength(item.length)} cm</span>
          )}
        </p>

        <div className="flex items-center gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={async () => {
                try {
                  await updateQuantity(item.id, item.quantity - 1)
                } catch (error) {
                  console.error(error)
                }
              }}
              disabled={item.quantity <= 1 || loading}
            >
              -
            </Button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={async () => {
                try {
                  await updateQuantity(item.id, item.quantity + 1)
                } catch (error) {
                  console.error(error)
                }
              }}
              disabled={item.quantity >= 10 || loading}
            >
              +
            </Button>
          </div>

          {/* Price */}
          <span className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</span>
        </div>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={async () => {
          try {
            await removeItem(item.id)
          } catch (error) {
            console.error(error)
          }
        }}
        className="flex-shrink-0"
        disabled={loading}
      >
        <Trash2 className="h-5 w-5" />
        <span className="sr-only">Remove item</span>
      </Button>
    </div>
  )
}
