import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { requireAdminUser } from "@/lib/auth/session"
import { listCollections, removeCollection } from "@/lib/db/queries"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    await requireAdminUser(cookies())
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const collectionList = await listCollections()
    const collection = collectionList.find((item) => item.id === id)
    if (!collection) {
      return NextResponse.json({ message: "Collection not found." }, { status: 404 })
    }

    await removeCollection(id)
    return NextResponse.json({ message: "Collection removed." })
  } catch (error) {
    console.error("Admin collection delete error", error)
    return NextResponse.json({ message: "Unable to delete collection." }, { status: 500 })
  }
}
