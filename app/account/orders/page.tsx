"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Package } from "lucide-react"
import type { Order } from "@/types"
import { useAuthStore } from "@/lib/store/auth-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const statusColor = (status: Order["status"]) => {
  switch (status) {
    case "delivered":
      return "bg-green-500/10 text-green-700 dark:text-green-400"
    case "shipped":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
    case "processing":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
    case "cancelled":
      return "bg-red-500/10 text-red-700 dark:text-red-400"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export default function OrdersPage() {
  const router = useRouter()
  const initAuth = useAuthStore((state) => state.init)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const authInitialized = useAuthStore((state) => state.initialized)
  const [orders, setOrders] = useState<Order[]>([])
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

    const loadOrders = async () => {
      try {
        const response = await fetch("/api/account/orders")
        if (response.status === 401) {
          router.push("/login")
          return
        }
        if (!response.ok) {
          throw new Error("Unable to load orders.")
        }
        const data = await response.json()
        setOrders(data.orders)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load orders.")
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [authInitialized, isAuthenticated, router])

  if (!authInitialized || (isAuthenticated && loading)) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold">Loading orders…</h1>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/account"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Account
          </Link>
          <h1 className="text-4xl font-bold mb-2">Order History</h1>
          <p className="text-muted-foreground">View and track your orders</p>
        </div>

        {error && <div className="mb-4 text-destructive">{error}</div>}

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-3">No Orders Yet</h2>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
            <Button asChild>
              <Link href="/products">Shop Now</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Order {order.orderNumber}</h3>
                    <p className="text-sm text-muted-foreground">
                      Placed on
                      {" "}
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge className={statusColor(order.status)}>{order.status.toUpperCase()}</Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-semibold">${order.total.toFixed(2)}</span>
                  </div>
                  {order.trackingNumber && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tracking Number</span>
                      <span className="font-mono text-xs">{order.trackingNumber}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="bg-transparent">
                    View Details
                  </Button>
                  {order.status === "delivered" && (
                    <Button variant="outline" size="sm" className="bg-transparent">
                      Buy Again
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
