"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/types"

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  initialized: boolean
  init: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: (redirect?: string) => boolean
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => void
}

const request = async (input: RequestInfo, init?: RequestInit) => {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    const message = typeof data?.message === "string" ? data.message : "Unable to complete the request."
    throw new Error(message)
  }

  return response.json()
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      initialized: false,

      init: async () => {
        if (get().initialized) return
        set({ loading: true, error: null })
        try {
          const data = await request("/api/auth/me")
          set({ user: data.user, isAuthenticated: Boolean(data.user), loading: false, initialized: true })
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to verify session."
          set({ user: null, isAuthenticated: false, loading: false, initialized: true, error: message })
        }
      },

      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const data = await request("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
          })
          set({ user: data.user, isAuthenticated: true, loading: false })
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to sign in."
          set({ loading: false, error: message })
          throw error
        }
      },

      loginWithGoogle: (redirect = "/account") => {
        const safeRedirect =
          redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/account"

        if (typeof window === "undefined") {
          console.warn("Google login can only be triggered in the browser.")
          return false
        }

        set({ loading: true, error: null })

        const params = new URLSearchParams()
        if (safeRedirect) {
          params.set("redirect", safeRedirect)
        }

        const authorizeUrl = `/api/auth/google/authorize?${params.toString()}`
        window.location.href = authorizeUrl
        return true
      },

      register: async (email, password, firstName, lastName) => {
        set({ loading: true, error: null })
        try {
          const data = await request("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({ email, password, firstName, lastName }),
          })
          set({ user: data.user, isAuthenticated: true, loading: false })
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to sign up."
          set({ loading: false, error: message })
          throw error
        }
      },

      logout: async () => {
        set({ loading: true, error: null })
        try {
          await request("/api/auth/logout", { method: "POST" })
        } finally {
          set({ user: null, isAuthenticated: false, loading: false })
        }
      },

      updateProfile: (data) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }))
      },
    }),
    {
      name: "nail-shop-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
)
