"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, CheckCircle2, Trash2, Star } from "lucide-react"
import type { Address } from "@/types"
import { useAuthStore } from "@/lib/store/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type AddressFormState = Omit<Address, "id" | "userId" | "isDefault"> & { addressLine2?: string; isDefault: boolean }

const blankForm: AddressFormState = {
  firstName: "",
  lastName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  phone: "",
  isDefault: false,
}

export default function AddressesPage() {
  const router = useRouter()
  const initAuth = useAuthStore((state) => state.init)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const authInitialized = useAuthStore((state) => state.initialized)
  const user = useAuthStore((state) => state.user)

  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formState, setFormState] = useState(blankForm)
  const [formSubmitting, setFormSubmitting] = useState(false)

  useEffect(() => {
    initAuth().catch(() => undefined)
  }, [initAuth])

  useEffect(() => {
    if (!authInitialized) return
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const loadAddresses = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/account/addresses")
        if (response.status === 401) {
          router.push("/login")
          return
        }
        if (!response.ok) {
          throw new Error("Unable to load addresses.")
        }
        const data = (await response.json()) as { addresses: Address[] }
        setAddresses(data.addresses)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load addresses.")
      } finally {
        setLoading(false)
      }
    }

    loadAddresses()
  }, [authInitialized, isAuthenticated, router])

  const handleInputChange = (field: keyof AddressFormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFormState((state) => ({
      ...state,
      [field]: value,
    }))
  }

  const handleToggleDefault = () => {
    setFormState((state) => ({
      ...state,
      isDefault: !state.isDefault,
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/account/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(typeof payload?.message === "string" ? payload.message : "Unable to save address.")
      }

      const data = (await response.json()) as { address: Address; addresses: Address[] }
      setAddresses(data.addresses ?? [data.address])
      setFormState(blankForm)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save address.")
    } finally {
      setFormSubmitting(false)
    }
  }

  const setDefaultAddress = async (addressId: string) => {
    try {
      const response = await fetch(`/api/account/addresses/${addressId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(typeof payload?.message === "string" ? payload.message : "Unable to set default address.")
      }
      const data = (await response.json()) as { addresses: Address[] }
      setAddresses(data.addresses)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to set default address.")
    }
  }

  const deleteAddress = async (addressId: string) => {
    try {
      const response = await fetch(`/api/account/addresses/${addressId}`, { method: "DELETE" })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(typeof payload?.message === "string" ? payload.message : "Unable to delete address.")
      }
      const data = (await response.json()) as { addresses: Address[] }
      setAddresses(data.addresses)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete address.")
    }
  }

  if (!authInitialized || (isAuthenticated && loading)) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold">Loading addresses…</h1>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <Link
            href="/account"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Account
          </Link>
          <h1 className="text-4xl font-bold mb-2">Saved Addresses</h1>
          <p className="text-muted-foreground">
            Manage the shipping destinations linked to your gelmanicure account.
          </p>
        </div>

        {error && <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

        <section className="space-y-4">
          {addresses.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-6 text-center space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto">
                <MapPin className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">No addresses yet</h2>
              <p className="text-sm text-muted-foreground">
                Add your default shipping address below so checkout feels effortless next time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <div key={address.id} className="bg-card border border-border rounded-lg p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {address.firstName} {address.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{address.phone}</p>
                    </div>
                    {address.isDefault && (
                      <div className="inline-flex items-center gap-1 text-xs text-primary font-semibold uppercase tracking-wide">
                        <Star className="h-4 w-4" />
                        Default
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{address.addressLine1}</p>
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    <p>
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p>{address.country}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent"
                        onClick={() => setDefaultAddress(address.id)}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Set as default
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => deleteAddress(address.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <Separator />

        <section className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-1">Add a new address</h2>
            <p className="text-sm text-muted-foreground">
              Save multiple destinations and switch the default anytime.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" required value={formState.firstName} onChange={handleInputChange("firstName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" required value={formState.lastName} onChange={handleInputChange("lastName")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input
                id="addressLine1"
                required
                value={formState.addressLine1}
                onChange={handleInputChange("addressLine1")}
                placeholder="Street address, P.O. box"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2 (optional)</Label>
              <Input
                id="addressLine2"
                value={formState.addressLine2}
                onChange={handleInputChange("addressLine2")}
                placeholder="Apartment, suite, unit"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" required value={formState.city} onChange={handleInputChange("city")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State / Region</Label>
                <Input id="state" required value={formState.state} onChange={handleInputChange("state")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" required value={formState.postalCode} onChange={handleInputChange("postalCode")} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" required value={formState.country} onChange={handleInputChange("country")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" required value={formState.phone} onChange={handleInputChange("phone")} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isDefault"
                type="checkbox"
                className="h-4 w-4 rounded border-border"
                checked={formState.isDefault}
                onChange={handleToggleDefault}
              />
              <Label htmlFor="isDefault" className="text-sm font-medium">
                Set as my default shipping address
              </Label>
            </div>

            <Button type="submit" disabled={formSubmitting}>
              {formSubmitting ? "Saving..." : "Save address"}
            </Button>
          </form>
        </section>
      </div>
    </div>
  )
}
