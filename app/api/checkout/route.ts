import { NextResponse } from "next/server"
import { z } from "zod"
import { cookies } from "next/headers"
import { CART_COOKIE, getSessionUser } from "@/lib/auth/session"
import { fetchCart } from "@/lib/db/queries"
import { InventoryError } from "@/lib/db/errors"
import { generateOrderNumber } from "@/lib/utils/orders"

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
})

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

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      console.error("Missing STRIPE_SECRET_KEY environment variable")
      return NextResponse.json({ message: "Payment processor not configured." }, { status: 500 })
    }

    const orderNumber = generateOrderNumber()
    const originHeader = request.headers.get("origin")
    const requestUrl = new URL(request.url)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? originHeader ?? `${requestUrl.protocol}//${requestUrl.host}`

    const sessionPayload = new URLSearchParams()
    sessionPayload.append("mode", "payment")
    sessionPayload.append("customer_email", data.email)
    sessionPayload.append("success_url", `${siteUrl.replace(/\/$/, "")}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`)
    sessionPayload.append("cancel_url", `${siteUrl.replace(/\/$/, "")}/checkout?canceled=1`)
    sessionPayload.append("metadata[order_number]", orderNumber)
    sessionPayload.append("metadata[cart_id]", cartId)

    const user = await getSessionUser(cookieStore)
    if (user?.id) {
      sessionPayload.append("metadata[user_id]", user.id)
    }

    sessionPayload.append("metadata[first_name]", data.firstName)
    sessionPayload.append("metadata[last_name]", data.lastName)
    sessionPayload.append("metadata[email]", data.email)
    sessionPayload.append("metadata[address]", data.address)
    sessionPayload.append("metadata[city]", data.city)
    sessionPayload.append("metadata[state]", data.state)
    sessionPayload.append("metadata[zip]", data.zipCode)
    sessionPayload.append("metadata[country]", data.country)
    sessionPayload.append("metadata[phone]", data.phone)

    const currency = "usd"
    cart.items.forEach((item, index) => {
      const prefix = `line_items[${index}]`
      const unitAmount = Math.round(item.product.price * 100)
      sessionPayload.append(`${prefix}[price_data][currency]`, currency)
      sessionPayload.append(`${prefix}[price_data][product_data][name]`, item.product.name)
      sessionPayload.append(`${prefix}[price_data][unit_amount]`, String(unitAmount))
      if (item.product.description) {
        sessionPayload.append(
          `${prefix}[price_data][product_data][description]`,
          item.product.description.slice(0, 500),
        )
      }
      sessionPayload.append(`${prefix}[quantity]`, String(item.quantity))
    })

    let lineItemIndex = cart.items.length
    if (cart.shipping > 0) {
      sessionPayload.append(`line_items[${lineItemIndex}][price_data][currency]`, currency)
      sessionPayload.append(`line_items[${lineItemIndex}][price_data][product_data][name]`, "Shipping")
      sessionPayload.append(
        `line_items[${lineItemIndex}][price_data][unit_amount]`,
        String(Math.round(cart.shipping * 100)),
      )
      sessionPayload.append(`line_items[${lineItemIndex}][quantity]`, "1")
      lineItemIndex += 1
    }

    if (cart.tax > 0) {
      sessionPayload.append(`line_items[${lineItemIndex}][price_data][currency]`, currency)
      sessionPayload.append(`line_items[${lineItemIndex}][price_data][product_data][name]`, "Tax")
      sessionPayload.append(
        `line_items[${lineItemIndex}][price_data][unit_amount]`,
        String(Math.round(cart.tax * 100)),
      )
      sessionPayload.append(`line_items[${lineItemIndex}][quantity]`, "1")
    }

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: sessionPayload.toString(),
    })

    const session = await stripeResponse.json()

    if (!stripeResponse.ok || !session?.url) {
      console.error("Stripe session creation failed", session)
      const message = typeof session?.error?.message === "string" ? session.error.message : undefined
      return NextResponse.json(
        {
          message: message ?? "Unable to initiate payment.",
          details: session,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ checkoutUrl: session.url })
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
