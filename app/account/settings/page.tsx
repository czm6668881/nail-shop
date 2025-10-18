"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Shield, Bell, Save } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface PreferencesState {
  marketingEmails: boolean
  productAlerts: boolean
  smsUpdates: boolean
}

const defaultPreferences: PreferencesState = {
  marketingEmails: true,
  productAlerts: true,
  smsUpdates: false,
}

export default function SettingsPage() {
  const router = useRouter()
  const initAuth = useAuthStore((state) => state.init)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const authInitialized = useAuthStore((state) => state.initialized)
  const user = useAuthStore((state) => state.user)

  const [preferences, setPreferences] = useState<PreferencesState>(defaultPreferences)
  const [prefStatus, setPrefStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [prefError, setPrefError] = useState("")

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [passwordError, setPasswordError] = useState("")

  useEffect(() => {
    initAuth().catch(() => undefined)
  }, [initAuth])

  useEffect(() => {
    if (!authInitialized) return
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const loadPreferences = async () => {
      try {
        const response = await fetch("/api/account/settings")
        if (response.status === 401) {
          router.push("/login")
          return
        }
        if (!response.ok) {
          throw new Error("Unable to load preferences.")
        }
        const data = (await response.json()) as { preferences: PreferencesState }
        setPreferences({ ...defaultPreferences, ...(data.preferences ?? {}) })
      } catch (error) {
        setPrefError(error instanceof Error ? error.message : "Unable to load preferences.")
      }
    }

    loadPreferences()
  }, [authInitialized, isAuthenticated, router])

  const updatePreference = (key: keyof PreferencesState) => (checked: boolean) => {
    setPreferences((state) => ({ ...state, [key]: checked }))
  }

  const savePreferences = async () => {
    setPrefStatus("saving")
    setPrefError("")
    try {
      const response = await fetch("/api/account/settings/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(typeof payload?.message === "string" ? payload.message : "Unable to save preferences.")
      }
      setPrefStatus("saved")
      setTimeout(() => setPrefStatus("idle"), 2500)
    } catch (error) {
      setPrefStatus("error")
      setPrefError(error instanceof Error ? error.message : "Unable to save preferences.")
    }
  }

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordStatus("saving")
    setPasswordError("")

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus("error")
      setPasswordError("New passwords do not match.")
      return
    }

    try {
      const response = await fetch("/api/account/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(typeof payload?.message === "string" ? payload.message : "Unable to update password.")
      }
      setPasswordStatus("saved")
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setTimeout(() => setPasswordStatus("idle"), 2500)
    } catch (error) {
      setPasswordStatus("error")
      setPasswordError(error instanceof Error ? error.message : "Unable to update password.")
    }
  }

  if (!authInitialized || (isAuthenticated && !user)) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold">Loading settings…</h1>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-10">
        <div>
          <Link
            href="/account"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Account
          </Link>
          <h1 className="text-4xl font-bold mb-2">Account Settings</h1>
          <p className="text-muted-foreground">Control how we contact you and keep your account secure.</p>
        </div>

        <section className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Notification Preferences</h2>
              <p className="text-sm text-muted-foreground">
                Tailor updates so you only receive the news you care about.
              </p>
            </div>
          </div>

          {prefError && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {prefError}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">Style inspiration & launches</p>
                <p className="text-sm text-muted-foreground">
                  Curated guides, limited drops, and community highlights.
                </p>
              </div>
              <Switch
                checked={preferences.marketingEmails}
                onCheckedChange={updatePreference("marketingEmails")}
                aria-label="Toggle marketing emails"
              />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">Back in stock alerts</p>
                <p className="text-sm text-muted-foreground">We will let you know when your saved sets return.</p>
              </div>
              <Switch
                checked={preferences.productAlerts}
                onCheckedChange={updatePreference("productAlerts")}
                aria-label="Toggle product alerts"
              />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">SMS for time-sensitive launches</p>
                <p className="text-sm text-muted-foreground">Standard messaging rates apply. Opt out anytime.</p>
              </div>
              <Switch
                checked={preferences.smsUpdates}
                onCheckedChange={updatePreference("smsUpdates")}
                aria-label="Toggle SMS updates"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={savePreferences} disabled={prefStatus === "saving"}>
              <Save className="mr-2 h-4 w-4" />
              {prefStatus === "saving" ? "Saving..." : "Save preferences"}
            </Button>
            {prefStatus === "saved" && <span className="text-sm text-primary">Preferences updated</span>}
            {prefStatus === "error" && (
              <span className="text-sm text-destructive">Could not update preferences. Try again.</span>
            )}
          </div>
        </section>

        <section className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Update Password</h2>
              <p className="text-sm text-muted-foreground">Choose a strong password with at least 8 characters.</p>
            </div>
          </div>

          {passwordError && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm((state) => ({ ...state, currentPassword: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                required
                minLength={8}
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm((state) => ({ ...state, newPassword: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(event) => setPasswordForm((state) => ({ ...state, confirmPassword: event.target.value }))}
              />
            </div>

            <Button type="submit" disabled={passwordStatus === "saving"}>
              {passwordStatus === "saving" ? "Updating password..." : "Update password"}
            </Button>
            {passwordStatus === "saved" && <p className="text-sm text-primary">Password updated successfully.</p>}
          </form>
        </section>
      </div>
    </div>
  )
}
