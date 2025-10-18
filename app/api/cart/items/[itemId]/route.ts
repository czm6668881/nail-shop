import { NextResponse } from "next/server"
import { z } from "zod"
import { cookies } from "next/headers"
import { CART_COOKIE } from "@/lib/auth/session"
import { fetchCart, updateCartItemQuantity, removeCartItem, touchCart } from "@/lib/db/queries"

const quantitySchema = z.object({
  quantity: z.number().int().min(1).max(10),
})

const ensureCartId = async () => {
  const cartStore = await cookies()
  const cartId = cartStore.get(CART_COOKIE)?.value
  if (!cartId) {
    throw new Error("Cart not found.")
  }
  return cartId
}

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ itemId: string }>
  },
) {
  try {
    const { itemId } = await params
    const cartId = await ensureCartId()
    const body = await request.json()
    const { quantity } = quantitySchema.parse(body)

    await updateCartItemQuantity(itemId, quantity)
    await touchCart(cartId)

    const updatedCart = await fetchCart(cartId)
    return NextResponse.json({ cart: updatedCart })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request.", issues: error.issues }, { status: 400 })
    }

    if (error instanceof Error && error.message === "Cart not found.") {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }

    console.error("Update cart item error", error)
    return NextResponse.json({ message: "Unable to update cart item." }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ itemId: string }>
  },
) {
  try {
    const { itemId } = await params
    const cartId = await ensureCartId()
    await removeCartItem(itemId)
    await touchCart(cartId)

    const updatedCart = await fetchCart(cartId)
    return NextResponse.json({ cart: updatedCart })
  } catch (error) {
    if (error instanceof Error && error.message === "Cart not found.") {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }

    console.error("Delete cart item error", error)
    return NextResponse.json({ message: "Unable to remove cart item." }, { status: 500 })
  }
}
