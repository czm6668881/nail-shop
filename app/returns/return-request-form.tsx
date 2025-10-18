'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const reasons = [
  { value: "fit", label: "Sizing did not fit as expected" },
  { value: "color", label: "Color or finish looked different in person" },
  { value: "defect", label: "Items arrived damaged or defective" },
  { value: "changed-mind", label: "Changed my mind" },
  { value: "other", label: "Other" },
]

export function ReturnRequestForm() {
  const [formData, setFormData] = useState({
    orderNumber: "",
    email: "",
    reason: "",
    items: "",
    notes: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setSuccessMessage("")
    setErrorMessage("")

    try {
      const response = await fetch("/api/support/returns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(typeof payload?.message === "string" ? payload.message : "Unable to submit return request.")
      }

      setSuccessMessage("Your return request has been received. Our team will follow up within one business day.")
      setFormData({
        orderNumber: "",
        email: "",
        reason: "",
        items: "",
        notes: "",
      })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to submit return request.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {successMessage && (
        <div className="rounded-md border border-primary/20 bg-primary/10 p-4 text-sm text-primary">{successMessage}</div>
      )}
      {errorMessage && (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="orderNumber">Order Number</Label>
          <Input
            id="orderNumber"
            placeholder="ORD-2025-001234"
            required
            value={formData.orderNumber}
            onChange={(event) => setFormData((state) => ({ ...state, orderNumber: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            value={formData.email}
            onChange={(event) => setFormData((state) => ({ ...state, email: event.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Return</Label>
        <Select
          value={formData.reason}
          onValueChange={(value) => setFormData((state) => ({ ...state, reason: value }))}
        >
          <SelectTrigger className="w-full" id="reason">
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            {reasons.map((reason) => (
              <SelectItem key={reason.value} value={reason.value}>
                {reason.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="items">Items You Are Returning</Label>
        <Textarea
          id="items"
          placeholder="Let us know which styles and sizes you are returning."
          required
          value={formData.items}
          onChange={(event) => setFormData((state) => ({ ...state, items: event.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Share any photos, packaging concerns, or preferences for an exchange."
          value={formData.notes}
          onChange={(event) => setFormData((state) => ({ ...state, notes: event.target.value }))}
        />
      </div>

      <Button type="submit" size="lg" className="w-full md:w-auto" disabled={submitting || !formData.reason}>
        {submitting ? "Submitting..." : "Submit Return Request"}
      </Button>
    </form>
  )
}
