import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { requireAdminUser } from "@/lib/auth/session"
import { deleteOrder } from "@/lib/db/queries"

export async function DELETE(_request: Request, context: unknown) {
  try {
    await requireAdminUser(cookies())
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { orderId } = (context as { params?: { orderId?: unknown } })?.params ?? {}
  if (typeof orderId !== "string" || orderId.length === 0) {
    return NextResponse.json({ message: "Invalid order id." }, { status: 400 })
  }

  try {
    await deleteOrder(orderId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin delete order error", error)
    if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
      return NextResponse.json({ message: "Order not found." }, { status: 404 })
    }
    return NextResponse.json({ message: "Unable to delete order." }, { status: 500 })
  }
}
