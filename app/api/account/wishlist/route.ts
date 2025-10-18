import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { addWishlistItem, listWishlistItems } from "@/lib/db/queries"

export async function GET() {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const items = await listWishlistItems(user.id)
  return NextResponse.json({ items })
}

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const payload = await request.json()
    const productId = typeof payload?.productId === "string" ? payload.productId.trim() : ""

    if (!productId) {
      return NextResponse.json({ message: "Product id is required." }, { status: 400 })
    }

    const item = await addWishlistItem(user.id, productId)
    if (!item) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 })
    }

    return NextResponse.json({ item })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to update wishlist." },
      { status: 500 },
    )
  }
}
