import { NextResponse } from "next/server"
import { createSupportTicket } from "@/lib/db/queries"

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    const name = String(payload?.name ?? "").trim()
    const email = String(payload?.email ?? "").trim().toLowerCase()
    const topic = String(payload?.topic ?? "").trim()
    const orderNumber = typeof payload?.orderNumber === "string" ? payload.orderNumber.trim() : ""
    const message = String(payload?.message ?? "").trim()

    if (!name || !email || !topic || !message) {
      return NextResponse.json({ message: "Please provide your name, email, topic, and message." }, { status: 400 })
    }

    await createSupportTicket({
      name,
      email,
      topic,
      orderNumber,
      message,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to submit your message." },
      { status: 500 },
    )
  }
}
