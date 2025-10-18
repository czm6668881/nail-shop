import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { requireAdminUser } from "@/lib/auth/session"
import { listBlogPosts } from "@/lib/db/queries"

export async function GET() {
  try {
    await requireAdminUser(cookies())
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const posts = await listBlogPosts(false)
    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Admin blog list error", error)
    return NextResponse.json({ message: "Unable to load blog posts." }, { status: 500 })
  }
}
