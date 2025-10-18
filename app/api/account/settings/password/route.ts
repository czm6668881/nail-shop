import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getSessionUser } from "@/lib/auth/session"
import { findUserById, updateUserPasswordHash } from "@/lib/db/queries"

export async function PUT(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const payload = await request.json()
    const currentPassword = String(payload?.currentPassword ?? "")
    const newPassword = String(payload?.newPassword ?? "")

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Current and new passwords are required." }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ message: "New password must be at least 8 characters." }, { status: 400 })
    }

    const existing = await findUserById(user.id)
    if (!existing) {
      return NextResponse.json({ message: "Account not found." }, { status: 404 })
    }

    if (!bcrypt.compareSync(currentPassword, existing.passwordHash)) {
      return NextResponse.json({ message: "Current password is incorrect." }, { status: 403 })
    }

    const newHash = bcrypt.hashSync(newPassword, 10)
    await updateUserPasswordHash(user.id, newHash)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to update password." },
      { status: 500 },
    )
  }
}
