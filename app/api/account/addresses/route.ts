import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { createAddressForUser, listAddressesByUser } from "@/lib/db/queries"

export async function GET() {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const addresses = await listAddressesByUser(user.id)
  return NextResponse.json({ addresses })
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const payload = await request.json()

    const requiredFields = ["firstName", "lastName", "addressLine1", "city", "state", "postalCode", "country", "phone"]
    for (const field of requiredFields) {
      const value = payload?.[field]
      if (typeof value !== "string" || value.trim().length === 0) {
        return NextResponse.json({ message: `Field "${field}" is required.` }, { status: 400 })
      }
    }

    const address = await createAddressForUser(user.id, {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      addressLine1: payload.addressLine1.trim(),
      addressLine2: typeof payload.addressLine2 === "string" ? payload.addressLine2.trim() : undefined,
      city: payload.city.trim(),
      state: payload.state.trim(),
      postalCode: payload.postalCode.trim(),
      country: payload.country.trim(),
      phone: payload.phone.trim(),
      isDefault: Boolean(payload.isDefault),
    })

    const addresses = await listAddressesByUser(user.id)
    return NextResponse.json({ address, addresses })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to save address." },
      { status: 500 },
    )
  }
}
