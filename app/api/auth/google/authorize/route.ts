import { randomBytes } from "crypto"
import { NextResponse } from "next/server"
import { GOOGLE_OAUTH_SCOPES, getGoogleClientId } from "@/lib/auth/google"

const STATE_COOKIE = "google_oauth_state"

type StateCookieValue = {
  state: string
  redirect: string
}

const encodeStateCookie = (value: StateCookieValue) => Buffer.from(JSON.stringify(value)).toString("base64url")

const sanitizeRedirect = (value: string | null): string => {
  if (!value) {
    return "/account"
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/account"
  }

  return value
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const origin = url.origin
    const redirectUri = `${origin}/api/auth/google/callback`
    const state = randomBytes(16).toString("hex")
    const redirect = sanitizeRedirect(url.searchParams.get("redirect"))

    const params = new URLSearchParams({
      client_id: getGoogleClientId(),
      redirect_uri: redirectUri,
      response_type: "code",
      scope: GOOGLE_OAUTH_SCOPES.join(" "),
      access_type: "offline",
      include_granted_scopes: "true",
      state,
      prompt: "select_account",
    })

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    const response = NextResponse.redirect(googleAuthUrl)

    response.cookies.set({
      name: STATE_COOKIE,
      value: encodeStateCookie({ state, redirect }),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10,
    })

    return response
  } catch (error) {
    console.error("Google OAuth authorize error", error)
    return NextResponse.json({ message: "Unable to start Google login." }, { status: 500 })
  }
}
