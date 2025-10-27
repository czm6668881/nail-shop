import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { requireAdminUser } from "@/lib/auth/session"
import { updateOrderTrackingNumber } from "@/lib/db/queries"

export async function PATCH(request: Request, context: unknown) {
  try {
    await requireAdminUser(cookies())
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { orderId } = (context as { params?: { orderId?: unknown } })?.params ?? {}
  if (typeof orderId !== "string" || orderId.length === 0) {
    return NextResponse.json({ message: "Invalid order id." }, { status: 400 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 })
  }

  const { trackingNumber } = (payload ?? {}) as { trackingNumber?: unknown }

  if (trackingNumber !== undefined && trackingNumber !== null && typeof trackingNumber !== "string") {
    return NextResponse.json({ message: "Tracking number must be a string." }, { status: 400 })
  }

  const normalizedTracking =
    typeof trackingNumber === "string" ? trackingNumber.trim() : trackingNumber === null ? null : undefined

  if (normalizedTracking === undefined) {
    return NextResponse.json({ message: "Tracking number is required." }, { status: 400 })
  }

  const finalTracking =
    typeof normalizedTracking === "string" && normalizedTracking.length === 0 ? null : normalizedTracking

  try {
    const order = await updateOrderTrackingNumber(orderId, finalTracking ?? null)
    return NextResponse.json({ order })
  } catch (error) {
    console.error("Update order tracking error", error)
    if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
      return NextResponse.json({ message: "Order not found." }, { status: 404 })
    }
    return NextResponse.json({ message: "Unable to update tracking number." }, { status: 500 })
  }
}
