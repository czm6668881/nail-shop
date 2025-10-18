import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { listOrdersByUser } from "@/lib/db/queries"

export async function GET() {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const orders = await listOrdersByUser(user.id)
  return NextResponse.json({ orders })
}
