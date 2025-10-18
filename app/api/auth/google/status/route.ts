import { NextResponse } from "next/server"

export function GET() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const enabled = Boolean(clientId && clientSecret)

  return NextResponse.json({ enabled })
}
