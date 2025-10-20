import { NextResponse } from "next/server"
import { z } from "zod"
import { randomUUID } from "crypto"
import { cookies } from "next/headers"
import { CART_COOKIE, getSessionUser } from "@/lib/auth/session"
import { clearCartItems, fetchCart, insertOrder, touchCart } from "@/lib/db/queries"
import { InventoryError } from "@/lib/db/errors"
import type { Order } from "@/types"

const checkoutSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().min(5),
  cardNumber: z.string().min(12),
  cardExpiry: z.string().min(4),
  cardCvc: z.string().min(3),
})

const generateOrderNumber = () => {
  const now = new Date()
  const year = now.getFullYear()
  const unique = String(now.getTime()).slice(-6)
  return `ORD-${year}-${unique}`
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const data = checkoutSchema.parse(payload)

    const cookieStore = await cookies()
    const cartId = cookieStore.get(CART_COOKIE)?.value
    if (!cartId) {
      return NextResponse.json({ message: "Cart is empty." }, { status: 400 })
    }

    const cart = await fetchCart(cartId)
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ message: "Cart is empty." }, { status: 400 })
    }

    const user = await getSessionUser(cookieStore)

    const timestamp = new Date().toISOString()
    const order: Order = {
      id: `order-${randomUUID()}`,
      userId: user?.id ?? "guest",
      orderNumber: generateOrderNumber(),
      items: cart.items,
      subtotal: cart.subtotal,
      tax: cart.tax,
      shipping: cart.shipping,
      total: cart.total,
      status: "processing",
      shippingAddress: {
        id: `addr-${randomUUID()}`,
        userId: user?.id ?? "guest",
        firstName: data.firstName,
        lastName: data.lastName,
        addressLine1: data.address,
        addressLine2: "",
        city: data.city,
        state: data.state,
        postalCode: data.zipCode,
        country: data.country,
        phone: data.phone,
        isDefault: false,
      },
      billingAddress: {
        id: `addr-${randomUUID()}`,
        userId: user?.id ?? "guest",
        firstName: data.firstName,
        lastName: data.lastName,
        addressLine1: data.address,
        addressLine2: "",
        city: data.city,
        state: data.state,
        postalCode: data.zipCode,
        country: data.country,
        phone: data.phone,
        isDefault: false,
      },
      paymentMethod: `Card ending in ${data.cardNumber.slice(-4)}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    await insertOrder(order)
    await clearCartItems(cartId)
    await touchCart(cartId)

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid checkout details.", issues: error.issues }, { status: 400 })
    }

    if (error instanceof InventoryError) {
      return NextResponse.json(
        {
          message: "Not enough stock to complete this order.",
          code: error.code,
          meta: error.meta ?? {},
        },
        { status: 409 },
      )
    }

    console.error("Checkout error", error)
    return NextResponse.json({ message: "Unable to complete checkout." }, { status: 500 })
  }
}
