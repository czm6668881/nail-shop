import { cookies } from "next/headers"
import { randomBytes } from "crypto"
import bcrypt from "bcryptjs"
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"
import {
  createSession,
  deleteSessionByToken,
  findSession,
  findUserByEmail,
  findUserById,
  insertUser,
  toPublicUser,
  updateUserProfile,
} from "@/lib/db/queries"
import type { User } from "@/types"

export const AUTH_COOKIE = "nailshop_auth"
export const CART_COOKIE = "nailshop_cart"

const sessionDurationMs = 1000 * 60 * 60 * 24 * 7 // 7 days

const getCookieStore = (store?: ReadonlyRequestCookies) => store ?? cookies()

export const getSessionUser = async (store?: ReadonlyRequestCookies): Promise<User | null> => {
  const cookieStore = getCookieStore(store)
  const token = cookieStore.get(AUTH_COOKIE)?.value
  if (!token) {
    return null
  }

  const result = await findSession(token)
  if (!result) {
    if ("delete" in cookieStore) {
      // In route handlers we can clear the cookie immediately
      // Readonly stores (server components) ignore this branch
      // @ts-expect-error narrow runtime access
      cookieStore.delete?.(AUTH_COOKIE)
    }
    return null
  }

  return toPublicUser(result.user)
}

export const requireAdminUser = async (store?: ReadonlyRequestCookies): Promise<User> => {
  const user = await getSessionUser(store)
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized")
  }

  return user
}

export const createAuthSession = async (userId: string) => {
  const token = randomBytes(48).toString("hex")
  const expiresAt = new Date(Date.now() + sessionDurationMs)
  await createSession(userId, token, expiresAt)

  cookies().set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  })
}

export const destroyAuthSession = async () => {
  const token = cookies().get(AUTH_COOKIE)?.value
  if (token) {
    await deleteSessionByToken(token)
  }
  cookies().delete(AUTH_COOKIE)
}

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  const user = await findUserByEmail(email)
  if (!user) {
    return null
  }

  if (!bcrypt.compareSync(password, user.passwordHash)) {
    return null
  }

  return toPublicUser(user)
}

export const registerUser = async ({
  email,
  password,
  firstName,
  lastName,
}: {
  email: string
  password: string
  firstName: string
  lastName: string
}): Promise<User> => {
  const existing = await findUserByEmail(email)
  if (existing) {
    throw new Error("Email is already in use.")
  }

  const id = `user-${randomBytes(12).toString("hex")}`
  const passwordHash = bcrypt.hashSync(password, 10)
  await insertUser({
    id,
    email,
    passwordHash,
    firstName,
    lastName,
  })

  const user = await findUserById(id)
  if (!user) {
    throw new Error("Unable to create user.")
  }

  return toPublicUser(user)
}

export const updateUser = async (userId: string, data: Partial<User>) => {
  await updateUserProfile(userId, data)
}
