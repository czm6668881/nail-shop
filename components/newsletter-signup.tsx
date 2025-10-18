"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type SubmissionState = "idle" | "loading" | "success" | "error"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<SubmissionState>("idle")
  const [message, setMessage] = useState("")

  const isLoading = status === "loading"

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error")
      setMessage("Please enter a valid email address.")
      return
    }

    setStatus("loading")
    setMessage("")

    // Simulate a request so the UI feels responsive even without a backend.
    await new Promise((resolve) => setTimeout(resolve, 800))

    setStatus("success")
    setMessage("You're all set! Check your inbox for our latest updates.")
    setEmail("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate aria-live="polite">
      <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          aria-label="Email address"
          required
          disabled={isLoading}
          className="h-11 bg-background px-4"
        />
        <Button type="submit" size="lg" className="sm:w-auto" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Subscribe"}
        </Button>
      </div>
      {status === "error" && message && (
        <p className="text-sm text-destructive text-center" role="alert">
          {message}
        </p>
      )}
      {status === "success" && message && (
        <p className="text-sm text-primary text-center" role="status">
          {message}
        </p>
      )}
    </form>
  )
}
