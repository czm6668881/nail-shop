"use client"

import { create } from "zustand"
import type { Cart, CartItem, NailSize, Product, SizeLengthMap } from "@/types"

const emptyCart: Cart = {
  id: "cart-placeholder",
  items: [],
  subtotal: 0,
  tax: 0,
  shipping: 0,
  total: 0,
  updatedAt: new Date().toISOString(),
}

interface CartStore {
  cart: Cart
  loading: boolean
  initialized: boolean
  error: string | null
  init: () => Promise<void>
  addItem: (product: Product, size: NailSize, quantity: number, length?: number | null) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  setCart: (cart: Cart) => void
  getItemCount: () => number
}

const parseCart = (cart: Cart | null | undefined): Cart => {
  if (!cart) return { ...emptyCart, updatedAt: new Date().toISOString() }

  const normalizeSizeLengths = (input: Product["sizeLengths"], sizes: NailSize[]): SizeLengthMap | undefined => {
    if (!input || typeof input !== "object") {
      return undefined
    }

    const sizeSet = new Set(sizes)
    const normalized = Object.entries(input).reduce<SizeLengthMap>((acc, [size, values]) => {
      if (!sizeSet.has(size as NailSize)) {
        return acc
      }
      const list = Array.isArray(values) ? values : [values]
      const sanitized = list
        .map((value) => (typeof value === "number" ? value : Number(value)))
        .filter((value) => Number.isFinite(value) && value > 0)

      if (sanitized.length > 0) {
        acc[size as NailSize] = Array.from(new Set(sanitized)).sort((a, b) => a - b)
      }
      return acc
    }, {})

    return Object.keys(normalized).length > 0 ? normalized : undefined
  }

  return {
    ...cart,
    items: (cart.items ?? []).map((item) => {
      const sizes = (item.product.sizes ?? []) as NailSize[]
      return {
        ...item,
        product: {
          ...item.product,
          images: item.product.images ?? [],
          sizes,
          features: item.product.features ?? [],
          materials: item.product.materials ?? [],
          sizeLengths: normalizeSizeLengths(item.product.sizeLengths, sizes),
        },
        length: typeof item.length === "number" && Number.isFinite(item.length) ? item.length : undefined,
      }
    }) as CartItem[],
  }
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
    const message = typeof data?.message === "string" ? data.message : "Something went wrong."
    throw new Error(message)
  }

  return response.json()
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: emptyCart,
  loading: false,
  initialized: false,
  error: null,

  setCart: (cart) => set({ cart: parseCart(cart), error: null }),

  init: async () => {
    if (get().initialized) return
    set({ loading: true })
    try {
      const data = await request("/api/cart")
      set({ cart: parseCart(data.cart), initialized: true, loading: false, error: null })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load cart."
      set({ cart: emptyCart, error: message, initialized: true, loading: false })
    }
  },

  addItem: async (product, size, quantity, length) => {
    set({ loading: true })
    try {
      const data = await request("/api/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId: product.id, size, quantity, length }),
      })
      set({ cart: parseCart(data.cart), loading: false, error: null, initialized: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to add item to cart."
      set({ loading: false, error: message })
      throw error
    }
  },

  removeItem: async (itemId) => {
    set({ loading: true })
    try {
      const data = await request(`/api/cart/items/${itemId}`, {
        method: "DELETE",
      })
      set({ cart: parseCart(data.cart), loading: false, error: null })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to remove item."
      set({ loading: false, error: message })
      throw error
    }
  },

  updateQuantity: async (itemId, quantity) => {
    if (quantity <= 0) return
    set({ loading: true })
    try {
      const data = await request(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      })
      set({ cart: parseCart(data.cart), loading: false, error: null })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update quantity."
      set({ loading: false, error: message })
      throw error
    }
  },

  clearCart: async () => {
    set({ loading: true })
    try {
      const data = await request("/api/cart", { method: "DELETE" })
      set({ cart: parseCart(data.cart), loading: false, error: null })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to clear cart."
      set({ loading: false, error: message })
      throw error
    }
  },

  getItemCount: () => {
    return get().cart.items.reduce((total, item) => total + item.quantity, 0)
  },
}))
