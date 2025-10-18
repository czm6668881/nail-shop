"use client"

import { useEffect } from "react"
import { useCartStore } from "@/lib/store/cart-store"
import { CartItem } from "@/components/cart-item"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ShoppingBag, ArrowRight } from "lucide-react"

export default function CartPage() {
  const cart = useCartStore((state) => state.cart)
  const initializeCart = useCartStore((state) => state.init)
  const initialized = useCartStore((state) => state.initialized)
  const loading = useCartStore((state) => state.loading)
  const error = useCartStore((state) => state.error)

  useEffect(() => {
    initializeCart().catch(() => undefined)
  }, [initializeCart])

  const isEmpty = cart.items.length === 0

  if (!initialized && loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold">Loading cart...</h1>
          <p className="text-muted-foreground">Please wait a moment.</p>
        </div>
      </div>
    )
  }

  if (!initialized && error) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold">Unable to load cart</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Your Cart is Empty</h1>
          <p className="text-muted-foreground">Start shopping to add items to your cart</p>
          <Button size="lg" asChild>
            <Link href="/products">
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-muted/30 rounded-lg p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">{cart.shipping === 0 ? "Free" : `$${cart.shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">${cart.tax.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
            </div>

            {cart.subtotal < 50 && (
              <div className="bg-accent rounded-md p-4 mb-6">
                <p className="text-sm text-center">
                  Add <span className="font-semibold">${(50 - cart.subtotal).toFixed(2)}</span> more for free shipping!
                </p>
              </div>
            )}

            <Button size="lg" className="w-full mb-3" asChild>
              <Link href="/checkout">
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button size="lg" variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
