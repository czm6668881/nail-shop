import { NextResponse } from "next/server"
import { z } from "zod"
import { authenticateUser, createAuthSession } from "@/lib/auth/session"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const data = loginSchema.parse(payload)

    const user = await authenticateUser(data.email, data.password)
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 })
    }

    await createAuthSession(user.id)

    return NextResponse.json({ user })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid login details.", issues: error.issues }, { status: 400 })
    }

    console.error("Auth login error", error)
    return NextResponse.json({ message: "Unable to sign in." }, { status: 500 })
  }
}
