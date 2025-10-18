import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { requireAdminUser } from "@/lib/auth/session"
import { listCollections } from "@/lib/db/queries"

export async function GET() {
  try {
    await requireAdminUser(cookies())
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const collections = await listCollections()
    return NextResponse.json({ collections })
  } catch (error) {
    console.error("Admin collections list error", error)
    return NextResponse.json({ message: "Unable to load collections." }, { status: 500 })
  }
}
