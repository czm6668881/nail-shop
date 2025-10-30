import { NextResponse } from "next/server"
import { z } from "zod"
import { cookies } from "next/headers"
import { CART_COOKIE, getSessionUser } from "@/lib/auth/session"
import { ensureCart, fetchCart, findProductById, touchCart, upsertCartItem } from "@/lib/db/queries"
import type { NailSize } from "@/types"
import { normalizeLengthValues } from "@/lib/utils/lengths"

const addItemSchema = z.object({
  productId: z.string().min(1),
  size: z.string().min(1).optional(),
  quantity: z.coerce.number().int().min(1).max(10),
  length: z.coerce.number().positive().optional().nullable(),
})

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const { productId, size, quantity, length } = addItemSchema.parse(payload)

    const product = await findProductById(productId)
    if (!product) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 })
    }

    if (!product.inStock) {
      return NextResponse.json({ message: "Product is currently out of stock." }, { status: 400 })
    }

    const availableSizes = Array.isArray(product.sizes) ? product.sizes : []
    if (availableSizes.length === 0) {
      return NextResponse.json({ message: "Selected product is missing size options." }, { status: 400 })
    }

    const normalizedSize = (size ?? availableSizes[0]) as NailSize
    if (!availableSizes.includes(normalizedSize)) {
      return NextResponse.json({ message: "Selected size is not available for this product." }, { status: 400 })
    }

    const cookieStore = await cookies()
    const cookieCartId = cookieStore.get(CART_COOKIE)?.value
    const user = await getSessionUser(cookieStore)
    const { cart, newlyCreated } = await ensureCart(cookieCartId, user?.id)

    if (newlyCreated || cookieCartId !== cart.id) {
      cookieStore.set({
        name: CART_COOKIE,
        value: cart.id,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      })
    }

    const availableLengths = normalizeLengthValues(product.sizeLengths?.[normalizedSize])
    let normalizedLength: number | null = null

    if (availableLengths.length > 0) {
      const roundedRequested = typeof length === "number" ? Number(length.toFixed(4)) : undefined
      const match =
        roundedRequested !== undefined
          ? availableLengths.find((value) => Math.abs(value - roundedRequested) < 0.0001)
          : availableLengths[0]

      if (typeof match !== "number") {
        return NextResponse.json({ message: "Selected length is not available for this size." }, { status: 400 })
      }

      normalizedLength = Number(match.toFixed(4))
    }

    await upsertCartItem({
      cartId: cart.id,
      productId,
      size: normalizedSize,
      quantity,
      length: normalizedLength,
    })
    await touchCart(cart.id)

    const updatedCart = await fetchCart(cart.id)
    return NextResponse.json({ cart: updatedCart })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request.", issues: error.issues }, { status: 400 })
    }

    console.error("Add cart item error", error)
    return NextResponse.json({ message: "Unable to add item to cart." }, { status: 500 })
  }
}
