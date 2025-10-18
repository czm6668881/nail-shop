import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createAuthSession } from "@/lib/auth/session"
import {
  exchangeCodeForProfile,
  findOrCreateUserFromGoogle,
  type GoogleProfile,
} from "@/lib/auth/google"

const STATE_COOKIE = "google_oauth_state"

type StateCookieValue = {
  state: string
  redirect: string
}

const decodeStateCookie = (value: string): StateCookieValue | null => {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as StateCookieValue
  } catch {
    return null
  }
}

const redirectWithError = (origin: string, code: string) => {
  const url = new URL("/login", origin)
  url.searchParams.set("error", code)
  return NextResponse.redirect(url)
}

const buildRedirectResponse = (origin: string, path: string) => {
  const destination = new URL(path || "/account", origin)
  return NextResponse.redirect(destination)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const origin = url.origin
  const cookieStore = cookies()
  const stateValue = cookieStore.get(STATE_COOKIE)?.value
  const queryState = url.searchParams.get("state") ?? ""
  const code = url.searchParams.get("code")
  const oauthError = url.searchParams.get("error")

  if (!stateValue) {
    const response = redirectWithError(origin, "google_state_missing")
    response.cookies.delete(STATE_COOKIE)
    return response
  }

  const stateData = decodeStateCookie(stateValue)
  if (!stateData) {
    const response = redirectWithError(origin, "google_state_invalid")
    response.cookies.delete(STATE_COOKIE)
    return response
  }

  if (stateData.state !== queryState) {
    const response = redirectWithError(origin, "google_state_mismatch")
    response.cookies.delete(STATE_COOKIE)
    return response
  }

  cookieStore.delete(STATE_COOKIE)

  if (oauthError) {
    const response = redirectWithError(origin, "google_access_denied")
    return response
  }

  if (!code) {
    const response = redirectWithError(origin, "google_code_missing")
    return response
  }

  try {
    const redirectUri = `${origin}/api/auth/google/callback`
    const profile: GoogleProfile = await exchangeCodeForProfile(code, redirectUri)
    const user = await findOrCreateUserFromGoogle(profile)
    await createAuthSession(user.id)

    const response = buildRedirectResponse(origin, stateData.redirect ?? "/account")
    response.cookies.delete(STATE_COOKIE)
    return response
  } catch (error) {
    console.error("Google OAuth callback error", error)
    const response = redirectWithError(origin, "google_auth_failed")
    response.cookies.delete(STATE_COOKIE)
    return response
  }
}
