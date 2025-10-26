import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { randomUUID } from "crypto"
import { CART_COOKIE, getSessionUser } from "@/lib/auth/session"
import { clearCartItems, fetchCart, insertOrder, touchCart } from "@/lib/db/queries"
import type { Order } from "@/types"
import { generateOrderNumber } from "@/lib/utils/orders"

const fetchStripeSession = async (sessionId: string, secretKey: string) => {
  const response = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=line_items`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
      cache: "no-store",
    },
  )

  const data = await response.json()
  if (!response.ok) {
    console.error("Failed to retrieve Stripe session", data)
    throw new Error("Unable to verify payment session.")
  }

  return data as {
    payment_status?: string
    metadata?: Record<string, string>
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const sessionId = url.searchParams.get("session_id")
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? `${url.protocol}//${url.host}`).replace(/\/$/, "")

  if (!sessionId) {
    return NextResponse.redirect(new URL("/checkout?error=missing_session", origin))
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) {
    console.error("Missing STRIPE_SECRET_KEY environment variable")
    return NextResponse.redirect(new URL("/checkout?error=payment_config", origin))
  }

  try {
    const session = await fetchStripeSession(sessionId, stripeSecretKey)

    if (session.payment_status !== "paid") {
      return NextResponse.redirect(new URL("/checkout?payment=unpaid", origin))
    }

    const metadata = session.metadata ?? {}
    const orderNumber = metadata.order_number ?? generateOrderNumber()

    const cookieStore = await cookies()
    const cartIdFromCookie = cookieStore.get(CART_COOKIE)?.value
    const cartId = metadata.cart_id ?? cartIdFromCookie

    if (!cartId) {
      return NextResponse.redirect(new URL("/checkout?error=no_cart", origin))
    }

    const cart = await fetchCart(cartId)
    if (!cart || cart.items.length === 0) {
      return NextResponse.redirect(new URL("/checkout?error=empty_cart", origin))
    }

    const user = await getSessionUser(cookieStore)
    const userId = metadata.user_id ?? user?.id ?? "guest"
    const timestamp = new Date().toISOString()

    const order: Order = {
      id: `order-${randomUUID()}`,
      userId,
      orderNumber,
      items: cart.items,
      subtotal: cart.subtotal,
      tax: cart.tax,
      shipping: cart.shipping,
      total: cart.total,
      status: "processing",
      shippingAddress: {
        id: `addr-${randomUUID()}`,
        userId,
        firstName: metadata.first_name ?? "",
        lastName: metadata.last_name ?? "",
        addressLine1: metadata.address ?? "",
        addressLine2: "",
        city: metadata.city ?? "",
        state: metadata.state ?? "",
        postalCode: metadata.zip ?? "",
        country: metadata.country ?? "",
        phone: metadata.phone ?? "",
        isDefault: false,
      },
      billingAddress: {
        id: `addr-${randomUUID()}`,
        userId,
        firstName: metadata.first_name ?? "",
        lastName: metadata.last_name ?? "",
        addressLine1: metadata.address ?? "",
        addressLine2: "",
        city: metadata.city ?? "",
        state: metadata.state ?? "",
        postalCode: metadata.zip ?? "",
        country: metadata.country ?? "",
        phone: metadata.phone ?? "",
        isDefault: false,
      },
      paymentMethod: "Stripe Checkout",
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    try {
      await insertOrder(order)
    } catch (error) {
      console.error("Order creation failed", error)
    }

    await clearCartItems(cartId)
    await touchCart(cartId)

    return NextResponse.redirect(
      new URL(`/order-confirmation?orderNumber=${encodeURIComponent(orderNumber)}`, origin),
    )
  } catch (error) {
    console.error("Stripe success handler error", error)
    return NextResponse.redirect(new URL("/checkout?error=stripe_error", origin))
  }
}
