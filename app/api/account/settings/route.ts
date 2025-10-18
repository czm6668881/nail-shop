import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { getNotificationPreferences } from "@/lib/db/queries"

export async function GET() {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const preferences = await getNotificationPreferences(user.id)
  return NextResponse.json({ preferences })
}
