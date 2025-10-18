import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { requireAdminUser } from "@/lib/auth/session"
import { deleteBlogPost, listBlogPosts } from "@/lib/db/queries"

type RouteParams = {
  params: {
    id: string
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = params

  try {
    await requireAdminUser(cookies())
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const posts = await listBlogPosts(false)
    const exists = posts.some((post) => post.id === id)
    if (!exists) {
      return NextResponse.json({ message: "Blog post not found." }, { status: 404 })
    }

    await deleteBlogPost(id)
    return NextResponse.json({ message: "Blog post deleted." })
  } catch (error) {
    console.error("Admin blog delete error", error)
    return NextResponse.json({ message: "Unable to delete blog post." }, { status: 500 })
  }
}
