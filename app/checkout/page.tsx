"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CreditCard, Truck, Lock } from "lucide-react"
import { useCartStore } from "@/lib/store/cart-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const initialForm = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "United States",
  phone: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvc: "",
}

export default function CheckoutPage() {
  const router = useRouter()
  const cart = useCartStore((state) => state.cart)
  const clearCart = useCartStore((state) => state.clearCart)
  const initializeCart = useCartStore((state) => state.init)
  const initialized = useCartStore((state) => state.initialized)
  const loading = useCartStore((state) => state.loading)
  const cartError = useCartStore((state) => state.error)

  const [formData, setFormData] = useState(initialForm)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeCart().catch(() => undefined)
  }, [initializeCart])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.message ?? "Unable to complete checkout.")
      }

      const data = await response.json()
      await clearCart()
      router.push(`/order-confirmation?orderNumber=${encodeURIComponent(data.orderNumber)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete checkout.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!initialized) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold">Preparing checkout…</h1>
          <p className="text-muted-foreground">We&apos;re loading your cart details.</p>
        </div>
      </div>
    )
  }

  if (initialized && cart.items.length === 0) {
    router.push("/cart")
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center gap-2 mb-6">
                <Truck className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Shipping Address</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(event) => setFormData({ ...formData, firstName: event.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(event) => setFormData({ ...formData, lastName: event.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    required
                    value={formData.address}
                    onChange={(event) => setFormData({ ...formData, address: event.target.value })}
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    required
                    value={formData.city}
                    onChange={(event) => setFormData({ ...formData, city: event.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State / Province</Label>
                  <Input
                    id="state"
                    required
                    value={formData.state}
                    onChange={(event) => setFormData({ ...formData, state: event.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                  <Input
                    id="zipCode"
                    required
                    value={formData.zipCode}
                    onChange={(event) => setFormData({ ...formData, zipCode: event.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    required
                    value={formData.country}
                    onChange={(event) => setFormData({ ...formData, country: event.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Payment Information</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    required
                    value={formData.cardNumber}
                    onChange={(event) => setFormData({ ...formData, cardNumber: event.target.value })}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cardExpiry">Expiry Date</Label>
                    <Input
                      id="cardExpiry"
                      required
                      value={formData.cardExpiry}
                      onChange={(event) => setFormData({ ...formData, cardExpiry: event.target.value })}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardCvc">CVC</Label>
                    <Input
                      id="cardCvc"
                      required
                      value={formData.cardCvc}
                      onChange={(event) => setFormData({ ...formData, cardCvc: event.target.value })}
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Your payment information is secure and encrypted</span>
              </div>
              {(error || cartError) && (
                <p className="text-sm text-destructive mt-4">{error ?? cartError}</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-muted/30 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                      <Image
                        src={item.product.images[0] || "/placeholder.svg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold mt-1">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="space-y-3 mb-6">
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

              <Button type="submit" size="lg" className="w-full" disabled={isProcessing || loading}>
                {isProcessing ? "Processing…" : "Complete Order"}
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                By completing your order, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-foreground">
                  Terms of Service
                </Link>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
