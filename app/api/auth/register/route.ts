import { NextResponse } from "next/server"
import { z } from "zod"
import { createAuthSession, registerUser } from "@/lib/auth/session"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const data = registerSchema.parse(payload)

    const user = await registerUser(data)
    await createAuthSession(user.id)

    return NextResponse.json({ user })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid registration details.", issues: error.issues }, { status: 400 })
    }

    console.error("Auth register error", error)
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to sign up." }, { status: 400 })
  }
}
