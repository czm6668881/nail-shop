import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { removeWishlistItem } from "@/lib/db/queries"

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    await removeWishlistItem(user.id, id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to update wishlist." },
      { status: 500 },
    )
  }
}
