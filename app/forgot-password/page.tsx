import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Lock } from "lucide-react"
import { ResetRequestForm } from "./reset-request-form"
import { siteConfig, toAbsoluteUrl } from "@/lib/config/site"

export const metadata: Metadata = {
  title: `Reset Your Password | ${siteConfig.name}`,
  description: `Request a password reset link for your ${siteConfig.name} account.`,
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: toAbsoluteUrl("/forgot-password"),
  },
}

export default function ForgotPasswordPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-md mx-auto space-y-8">
        <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Link>

        <div className="text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Forgot password?</h1>
          <p className="text-muted-foreground">
            Enter the email associated with your account and we will send reset instructions.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8">
          <ResetRequestForm />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
