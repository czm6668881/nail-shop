import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { requireAdminUser } from "@/lib/auth/session"
import { listOrders } from "@/lib/db/queries"

export async function GET() {
  try {
    await requireAdminUser(cookies())
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const orders = await listOrders()
    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Admin orders list error", error)
    return NextResponse.json({ message: "Unable to load orders." }, { status: 500 })
  }
}
