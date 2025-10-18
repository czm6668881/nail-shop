import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { CART_COOKIE, getSessionUser } from "@/lib/auth/session"
import { clearCartItems, ensureCart, fetchCart, touchCart } from "@/lib/db/queries"

const cartCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
}

export async function GET() {
  const cookieStore = cookies()
  const cookieCartId = cookieStore.get(CART_COOKIE)?.value
  const user = await getSessionUser(cookieStore)
  const { cart, newlyCreated } = await ensureCart(cookieCartId, user?.id)

  if (newlyCreated || cookieCartId !== cart.id) {
    cookieStore.set({
      name: CART_COOKIE,
      value: cart.id,
      ...cartCookieOptions,
    })
  }

  const loadedCart = await fetchCart(cart.id)
  if (!loadedCart) {
    await touchCart(cart.id)
    return NextResponse.json({
      cart: {
        id: cart.id,
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        updatedAt: cart.updated_at,
      },
    })
  }

  return NextResponse.json({ cart: loadedCart })
}

export async function DELETE() {
  const cookieStore = cookies()
  const cartId = cookieStore.get(CART_COOKIE)?.value
  if (!cartId) {
    return NextResponse.json({ cart: null }, { status: 204 })
  }

  await clearCartItems(cartId)
  await touchCart(cartId)

  return NextResponse.json({
    cart: {
      id: cartId,
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      updatedAt: new Date().toISOString(),
    },
  })
}
