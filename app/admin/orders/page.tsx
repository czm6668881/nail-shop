"use client"

import type { FormEvent } from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Truck } from "lucide-react"
import type { Order } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [trackingInput, setTrackingInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

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

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setSelectedOrder(null)
      setTrackingInput("")
      setFormError(null)
    }
  }

  const openTrackingDialog = (order: Order) => {
    setSelectedOrder(order)
    setTrackingInput(order.trackingNumber ?? "")
    setFormError(null)
    setDialogOpen(true)
  }

  const handleTrackingSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedOrder) {
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}/tracking`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trackingNumber: trackingInput.trim() }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message ?? "Unable to update tracking number.")
      }
      const data = await response.json()
      const updatedOrder: Order = data.order
      setOrders((prev) => prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)))
      setSelectedOrder(updatedOrder)
      handleDialogOpenChange(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to update tracking number.")
    } finally {
      setSaving(false)
    }
  }

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
                    <p className="text-xs text-muted-foreground mt-1">
                      Tracking:
                      {" "}
                      {order.trackingNumber ? (
                        <span className="font-mono text-xs text-foreground">{order.trackingNumber}</span>
                      ) : (
                        <span className="italic">Pending</span>
                      )}
                    </p>
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
                    <div className="flex items-center justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-2 rounded-full shadow-sm"
                        onClick={() => openTrackingDialog(order)}
                      >
                        <Truck className="h-4 w-4" />
                        <span className="font-medium text-sm">Manage Tracking</span>
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

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleTrackingSubmit} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Update tracking</DialogTitle>
              <DialogDescription>
                {selectedOrder ? `Set the tracking number for order ${selectedOrder.orderNumber}. Leave blank to clear it.` : "Set the tracking number for this order."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trackingNumber">Tracking number</Label>
                <Input
                  id="trackingNumber"
                  value={trackingInput}
                  onChange={(event) => setTrackingInput(event.target.value)}
                  placeholder="e.g. 1Z999AA10123456784"
                  disabled={saving}
                  autoFocus
                />
              </div>
              {formError && <p className="text-sm text-destructive">{formError}</p>}
            </div>
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
