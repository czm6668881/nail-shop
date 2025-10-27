"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Eye, Mail } from "lucide-react"
import type { User } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null)

  const handleComposeEmail = (email: string) => {
    const sanitizedEmail = email.trim()
    if (!sanitizedEmail) {
      return
    }
    const params = new URLSearchParams({ to: sanitizedEmail })
    const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?${params.toString()}`
    const newWindow = window.open(outlookUrl, "_blank", "noopener,noreferrer")
    if (!newWindow) {
      window.location.href = `mailto:${sanitizedEmail}`
    }
  }

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await fetch("/api/admin/customers")
        if (!response.ok) {
          throw new Error("Unable to load customers.")
        }
        const data = await response.json()
        setCustomers(data.users)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load customers.")
      } finally {
        setLoading(false)
      }
    }

    loadCustomers()
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
          <h1 className="text-4xl font-bold mb-2">Customers</h1>
          <p className="text-muted-foreground">Manage customer accounts and information</p>
        </div>
      </div>

      {error && <div className="mb-4 text-destructive">{error}</div>}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold">Customer</th>
                <th className="text-left p-4 font-semibold">Email</th>
                <th className="text-left p-4 font-semibold">Joined</th>
                <th className="text-left p-4 font-semibold">Role</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <CustomerAvatar customer={customer} />
                      <div>
                        <p className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm">{customer.email}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm">
                      {new Date(customer.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </td>
                  <td className="p-4">
                    <Badge className="bg-muted text-muted-foreground">{customer.role.toUpperCase()}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedCustomer(customer)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleComposeEmail(customer.email)}>
                        <Mail className="h-4 w-4" />
                        <span className="sr-only">Send email</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    Loading customers...
                  </td>
                </tr>
              )}
              {!loading && customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    No customers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Showing {customers.length} customers</p>
        </div>
      )}

      <Dialog open={selectedCustomer !== null} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customer details</DialogTitle>
            <DialogDescription>Quick reference for contact and account status.</DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CustomerAvatar customer={selectedCustomer} size="lg" />
                <div>
                  <p className="text-lg font-semibold">
                    {selectedCustomer.firstName}
                    {" "}
                    {selectedCustomer.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-3 text-sm">
                <DetailRow label="User ID" value={selectedCustomer.id} />
                <DetailRow
                  label="Joined"
                  value={new Date(selectedCustomer.createdAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
                <DetailRow label="Role" value={selectedCustomer.role.toUpperCase()} />
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                if (selectedCustomer) {
                  handleComposeEmail(selectedCustomer.email)
                }
              }}
            >
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </Button>
            <Button className="w-full sm:w-auto" onClick={() => setSelectedCustomer(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CustomerAvatar({ customer, size = "md" }: { customer: User; size?: "md" | "lg" }) {
  const initials = `${customer.firstName?.[0] ?? ""}${customer.lastName?.[0] ?? ""}`.toUpperCase() || "?"
  const dimension = size === "lg" ? "h-12 w-12 text-base" : "h-10 w-10 text-sm"
  return (
    <div className={`rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ${dimension}`}>
      <span className="font-semibold text-primary">{initials}</span>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right break-all">{value}</span>
    </div>
  )
}
