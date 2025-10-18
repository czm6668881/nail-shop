import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionUser } from "@/lib/auth/session"

export async function GET() {
  try {
    const user = await getSessionUser(cookies())
    return NextResponse.json({ user: user ?? null })
  } catch (error) {
    console.error("Auth me error", error)
    return NextResponse.json({ message: "Unable to verify session." }, { status: 500 })
  }
}
