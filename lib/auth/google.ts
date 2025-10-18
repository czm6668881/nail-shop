import { randomBytes } from "crypto"
import bcrypt from "bcryptjs"
import { OAuth2Client } from "google-auth-library"
import {
  findUserByEmail,
  findUserByGoogleId,
  findUserById,
  insertUser,
  linkGoogleAccount,
  toPublicUser,
  type AuthUser,
} from "@/lib/db/queries"
import type { User } from "@/types"

export const GOOGLE_OAUTH_SCOPES = ["openid", "email", "profile"]

const getGoogleCredentials = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth environment variables are not configured.")
  }

  return { clientId, clientSecret }
}

export const getGoogleClientId = () => getGoogleCredentials().clientId

export const getGoogleOAuthClient = (redirectUri: string) => {
  const { clientId, clientSecret } = getGoogleCredentials()
  return new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri,
  })
}

export type GoogleProfile = {
  sub: string
  email: string
  email_verified?: boolean
  given_name?: string
  family_name?: string
  name?: string
  picture?: string
}

export const exchangeCodeForProfile = async (code: string, redirectUri: string): Promise<GoogleProfile> => {
  const { clientId } = getGoogleCredentials()
  const client = getGoogleOAuthClient(redirectUri)
  const { tokens } = await client.getToken(code)

  if (!tokens.id_token) {
    throw new Error("Missing Google ID token in response.")
  }

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: clientId,
  })
  const payload = ticket.getPayload()

  if (!payload || !payload.sub || !payload.email) {
    throw new Error("Google account response is missing required fields.")
  }

  return {
    sub: payload.sub,
    email: payload.email,
    email_verified: payload.email_verified,
    given_name: payload.given_name,
    family_name: payload.family_name,
    name: payload.name,
    picture: payload.picture ?? undefined,
  }
}

const normalizeName = (value?: string) => value?.trim() ?? ""

const deriveNameParts = (profile: GoogleProfile): Pick<User, "firstName" | "lastName"> => {
  const emailPrefix = profile.email.split("@")[0] ?? "Guest"
  const fallbacks = profile.name ? profile.name.split(" ").filter(Boolean) : []
  const firstName =
    normalizeName(profile.given_name) || fallbacks[0] || emailPrefix || "Guest"
  const lastName =
    normalizeName(profile.family_name) || fallbacks.slice(1).join(" ") || "User"

  return {
    firstName: firstName || "Guest",
    lastName: lastName || "User",
  }
}

export const findOrCreateUserFromGoogle = async (profile: GoogleProfile): Promise<AuthUser> => {
  const existingByGoogle = await findUserByGoogleId(profile.sub)
  if (existingByGoogle) {
    if (profile.picture) {
      await linkGoogleAccount(existingByGoogle.id, profile.sub, profile.picture)
      const refreshed = await findUserById(existingByGoogle.id)
      if (refreshed) {
        return refreshed
      }
    }
    return existingByGoogle
  }

  const existingByEmail = await findUserByEmail(profile.email)
  if (existingByEmail) {
    await linkGoogleAccount(existingByEmail.id, profile.sub, profile.picture)
    const refreshed = await findUserById(existingByEmail.id)
    if (refreshed) {
      return refreshed
    }
    const fallback: AuthUser = {
      ...existingByEmail,
      googleId: profile.sub,
      avatar: profile.picture ?? existingByEmail.avatar,
    }
    return fallback
  }

  const { firstName, lastName } = deriveNameParts(profile)
  const userId = `user-${randomBytes(12).toString("hex")}`
  const passwordHash = bcrypt.hashSync(randomBytes(24).toString("hex"), 10)

  await insertUser({
    id: userId,
    email: profile.email,
    passwordHash,
    firstName,
    lastName,
    avatar: profile.picture,
    googleId: profile.sub,
  })

  const created = await findUserById(userId)
  if (!created) {
    throw new Error("Failed to create account for Google user.")
  }

  return created
}

export const toPublicGoogleUser = (user: AuthUser) => toPublicUser(user)
