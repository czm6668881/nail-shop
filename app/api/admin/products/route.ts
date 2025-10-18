import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { requireAdminUser } from "@/lib/auth/session"
import { listProducts } from "@/lib/db/queries"

export async function GET() {
  try {
    await requireAdminUser(cookies())
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const products = await listProducts()
    return NextResponse.json({ products })
  } catch (error) {
    console.error("Admin products list error", error)
    return NextResponse.json({ message: "Unable to load products." }, { status: 500 })
  }
}
