import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { upsertNotificationPreferences } from "@/lib/db/queries"

export async function PUT(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const payload = await request.json()
    const marketingEmails = Boolean(payload?.marketingEmails ?? true)
    const productAlerts = Boolean(payload?.productAlerts ?? true)
    const smsUpdates = Boolean(payload?.smsUpdates ?? false)

    await upsertNotificationPreferences(user.id, {
      marketingEmails,
      productAlerts,
      smsUpdates,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to update preferences." },
      { status: 500 },
    )
  }
}
