import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { requireAdminUser } from "@/lib/auth/session"
import { listUsers } from "@/lib/db/queries"

export async function GET() {
  try {
    await requireAdminUser(cookies())
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const users = await listUsers()
    return NextResponse.json({ users })
  } catch (error) {
    console.error("Admin customers list error", error)
    return NextResponse.json({ message: "Unable to load customers." }, { status: 500 })
  }
}
