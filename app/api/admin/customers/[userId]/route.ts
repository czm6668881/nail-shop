import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { requireAdminUser } from "@/lib/auth/session"
import { deleteUser } from "@/lib/db/queries"

export async function DELETE(_request: Request, context: unknown) {
  try {
    await requireAdminUser(cookies())
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { userId } = (context as { params?: { userId?: unknown } })?.params ?? {}
  if (typeof userId !== "string" || userId.length === 0) {
    return NextResponse.json({ message: "Invalid user id." }, { status: 400 })
  }

  try {
    await deleteUser(userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin delete customer error", error)
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return NextResponse.json({ message: "User not found." }, { status: 404 })
    }
    return NextResponse.json({ message: "Unable to delete customer." }, { status: 500 })
  }
}
