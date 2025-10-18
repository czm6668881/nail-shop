import { NextResponse } from "next/server"
import { createReturnRequest } from "@/lib/db/queries"

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    const orderNumber = String(payload?.orderNumber ?? "").trim()
    const email = String(payload?.email ?? "").trim().toLowerCase()
    const reason = String(payload?.reason ?? "").trim()
    const items = String(payload?.items ?? "").trim()
    const notes = typeof payload?.notes === "string" ? payload.notes.trim() : ""

    if (!orderNumber || !email || !reason || !items) {
      return NextResponse.json(
        { message: "Order number, email, reason, and item details are required." },
        { status: 400 },
      )
    }

    await createReturnRequest({
      orderNumber,
      email,
      reason,
      items,
      notes,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to submit return request." },
      { status: 500 },
    )
  }
}
