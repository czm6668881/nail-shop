"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Eye } from "lucide-react"
import type { Order } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const statusVariants: Record<Order["status"], string> = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  processing: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  shipped: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  delivered: "bg-green-500/10 text-green-700 dark:text-green-400",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await fetch("/api/admin/orders")
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
  }, [])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <div>
          <h1 className="text-4xl font-bold mb-2">Orders</h1>
          <p className="text-muted-foreground">View and manage customer orders</p>
        </div>
      </div>

      {error && <div className="mb-4 text-destructive">{error}</div>}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold">Order Number</th>
                <th className="text-left p-4 font-semibold">Customer</th>
                <th className="text-left p-4 font-semibold">Date</th>
                <th className="text-left p-4 font-semibold">Total</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <p className="font-medium font-mono text-sm">{order.orderNumber}</p>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{order.shippingAddress.city}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold">${order.total.toFixed(2)}</p>
                  </td>
                  <td className="p-4">
                    <Badge className={statusVariants[order.status]}>{order.status.toUpperCase()}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    Loading orders...
                  </td>
                </tr>
              )}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Showing {orders.length} orders</p>
        </div>
      )}
    </div>
  )
}
