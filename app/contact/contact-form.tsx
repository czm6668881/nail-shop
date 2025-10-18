'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const topics = [
  { value: "order", label: "Order Status" },
  { value: "returns", label: "Returns & Exchanges" },
  { value: "product", label: "Product Question" },
  { value: "press", label: "Press & Partnerships" },
  { value: "other", label: "Something Else" },
]

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "",
    orderNumber: "",
    message: "",
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
      const response = await fetch("/api/support/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(typeof payload?.message === "string" ? payload.message : "Unable to send your message.")
      }

      setSuccessMessage("Thanks for reaching out! We will reply within one business day.")
      setFormData({
        name: "",
        email: "",
        topic: "",
        orderNumber: "",
        message: "",
      })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to send your message.")
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
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="Your name"
            required
            value={formData.name}
            onChange={(event) => setFormData((state) => ({ ...state, name: event.target.value }))}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="topic">Topic</Label>
          <Select value={formData.topic} onValueChange={(value) => setFormData((state) => ({ ...state, topic: value }))}>
            <SelectTrigger id="topic" className="w-full">
              <SelectValue placeholder="What can we help with?" />
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic) => (
                <SelectItem key={topic.value} value={topic.value}>
                  {topic.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="orderNumber">Order Number (optional)</Label>
          <Input
            id="orderNumber"
            placeholder="ORD-2025-001234"
            value={formData.orderNumber}
            onChange={(event) => setFormData((state) => ({ ...state, orderNumber: event.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          required
          placeholder="Share as many details as possible so we can help quickly."
          value={formData.message}
          onChange={(event) => setFormData((state) => ({ ...state, message: event.target.value }))}
        />
      </div>

      <Button type="submit" size="lg" className="w-full md:w-auto" disabled={submitting || !formData.topic}>
        {submitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  )
}
