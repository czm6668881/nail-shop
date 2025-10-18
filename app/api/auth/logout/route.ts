import { NextResponse } from "next/server"
import { destroyAuthSession } from "@/lib/auth/session"

export async function POST() {
  try {
    await destroyAuthSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Auth logout error", error)
    return NextResponse.json({ message: "Unable to sign out." }, { status: 500 })
  }
}
