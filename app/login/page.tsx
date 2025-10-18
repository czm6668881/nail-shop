"use client"

import type React from "react"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/lib/store/auth-store"
import { Lock, Mail } from "lucide-react"

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google_state_missing: "Unable to verify the login request. Please try again.",
  google_state_invalid: "Your Google login link expired. Please try again.",
  google_state_mismatch: "We couldn't verify your Google login. Please try again.",
  google_access_denied: "Google sign-in was cancelled.",
  google_code_missing: "Missing Google sign-in code. Please try again.",
  google_auth_failed: "Google sign-in failed. Please try again later.",
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.78-.07-1.53-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.27-2.09 3.57-5.17 3.57-8.64Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.97-1.07 7.96-2.9l-3.87-3c-1.08.72-2.47 1.15-4.09 1.15-3.14 0-5.8-2.12-6.74-4.97h-3.96v3.11A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.26 14.28A7.2 7.2 0 0 1 4.87 12c0-.8.14-1.57.38-2.28V6.61H1.29A11.99 11.99 0 0 0 0 12c0 1.9.45 3.69 1.29 5.29l3.97-3.01Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.33.6 4.57 1.8l3.42-3.42C17.95 1.12 15.22 0 12 0 7.35 0 3.34 2.69 1.29 6.61l3.96 3.11C6.2 6.89 8.86 4.75 12 4.75Z"
      />
    </svg>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useAuthStore((state) => state.login)
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false)
  const [error, setError] = useState("")
  const [isGoogleLoginEnabled, setIsGoogleLoginEnabled] = useState(
    Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID),
  )

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const oauthError = searchParams.get("error")

  useEffect(() => {
    if (!oauthError) {
      return
    }
    if (oauthError.startsWith("google_")) {
      setError(GOOGLE_ERROR_MESSAGES[oauthError] ?? GOOGLE_ERROR_MESSAGES.google_auth_failed)
      setIsGoogleRedirecting(false)
      setIsLoading(false)
    }
  }, [oauthError])

  useEffect(() => {
    if (isGoogleLoginEnabled) {
      return
    }

    let active = true
    const controller = new AbortController()

    const checkGoogleStatus = async () => {
      try {
        const response = await fetch("/api/auth/google/status", {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        })

        if (!response.ok) {
          return
        }

        const data = (await response.json()) as { enabled?: boolean } | null
        if (active && data?.enabled) {
          setIsGoogleLoginEnabled(true)
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Failed to detect Google login availability", error)
        }
      }
    }

    checkGoogleStatus()

    return () => {
      active = false
      controller.abort()
    }
  }, [isGoogleLoginEnabled])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(formData.email, formData.password)
      const redirectTo = searchParams.get("redirect") || "/account"
      router.push(redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    setError("")
    const redirect = searchParams.get("redirect") ?? undefined
    const started = loginWithGoogle(redirect ?? undefined)
    if (started) {
      setIsGoogleRedirecting(true)
    } else {
      setIsGoogleRedirecting(false)
      setError("Google sign-in is only available in the browser.")
    }
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm rounded-md p-3 border border-destructive/20">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading || isGoogleRedirecting}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {isGoogleLoginEnabled && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isGoogleRedirecting}
              >
                <GoogleIcon className="h-5 w-5" />
                {isGoogleRedirecting ? "Connecting..." : "Continue with Google"}
              </Button>
            </>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don&apos;t have an account? </span>
            <Link href="/register" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
