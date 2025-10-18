import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { requireAdminUser } from "@/lib/auth/session"
import { listBlogPosts, toggleBlogPublish } from "@/lib/db/queries"

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
    const { published } = (await request.json()) as { published?: unknown }
    if (typeof published !== "boolean") {
      return NextResponse.json({ message: "Invalid publish state." }, { status: 400 })
    }

    const posts = await listBlogPosts(false)
    const exists = posts.some((post) => post.id === id)
    if (!exists) {
      return NextResponse.json({ message: "Blog post not found." }, { status: 404 })
    }

    await toggleBlogPublish(id, published)
    return NextResponse.json({ id, published })
  } catch (error) {
    console.error("Admin blog publish toggle error", error)
    return NextResponse.json({ message: "Unable to update publish status." }, { status: 500 })
  }
}
