import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { requireAdminUser } from "@/lib/auth/session"
import { listCollections, toggleCollectionFeatured } from "@/lib/db/queries"

type RouteParams = {
  params: {
    id: string
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = params

  try {
    await requireAdminUser(cookies())
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { featured } = (await request.json()) as { featured?: unknown }
    if (typeof featured !== "boolean") {
      return NextResponse.json({ message: "Invalid featured value." }, { status: 400 })
    }

    const collectionList = await listCollections()
    const collection = collectionList.find((item) => item.id === id)
    if (!collection) {
      return NextResponse.json({ message: "Collection not found." }, { status: 404 })
    }

    await toggleCollectionFeatured(id, featured)
    return NextResponse.json({ id, featured })
  } catch (error) {
    console.error("Admin collection update error", error)
    return NextResponse.json({ message: "Unable to update collection." }, { status: 500 })
  }
}
