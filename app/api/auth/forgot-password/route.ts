import { NextResponse } from "next/server"
import { createPasswordResetToken, findUserByEmail } from "@/lib/db/queries"

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : ""

    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 })
    }

    const user = await findUserByEmail(email)
    if (user) {
      const token = await createPasswordResetToken(user.id)
      if (process.env.NODE_ENV !== "production") {
        console.info(`[password-reset] Token for ${email}: ${token}`)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to process password reset." },
      { status: 500 },
    )
  }
}
