import { NextResponse } from "next/server"
import { z } from "zod"
import { cookies } from "next/headers"
import { CART_COOKIE, getSessionUser } from "@/lib/auth/session"
import { ensureCart, fetchCart, findProductById, touchCart, upsertCartItem } from "@/lib/db/queries"
import type { NailSize } from "@/types"

const addItemSchema = z.object({
  productId: z.string().min(1),
  size: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
})

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const { productId, size, quantity } = addItemSchema.parse(payload)

    const product = await findProductById(productId)
    if (!product) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 })
    }

    if (!product.inStock) {
      return NextResponse.json({ message: "Product is currently out of stock." }, { status: 400 })
    }

    const selectedSize = size as NailSize
    if (!product.sizes.includes(selectedSize)) {
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

    await upsertCartItem({ cartId: cart.id, productId, size: selectedSize, quantity })
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
