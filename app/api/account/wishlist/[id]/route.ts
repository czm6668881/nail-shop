import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { removeWishlistItem } from "@/lib/db/queries"

interface RouteParams {
  params: {
    id: string
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    await removeWishlistItem(user.id, params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to update wishlist." },
      { status: 500 },
    )
  }
}
