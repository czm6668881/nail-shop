import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { randomUUID } from "crypto"
import { requireAdminUser } from "@/lib/auth/session"
import { listBlogPosts, upsertBlogPost, findBlogPostBySlug } from "@/lib/db/queries"
import { revalidateBlogCache } from "@/lib/cache"
import { slugify } from "@/lib/utils/slug"
import type { BlogCategory } from "@/types"

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

const CATEGORY_VALUES: BlogCategory[] = ["tutorial", "tips", "trends", "care", "inspiration"]

const sanitiseTags = (input: unknown): string[] => {
  if (Array.isArray(input)) {
    return input
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .filter((value) => value.length > 0)
  }
  return []
}

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ")

const estimateReadTime = (content: string) => {
  const words = stripHtml(content)
    .split(/\s+/)
    .filter((word) => word.length > 0)
  return Math.max(1, Math.ceil(words.length / 200))
}

export async function POST(request: Request) {
  try {
    await requireAdminUser(cookies())
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    const rawTitle = typeof body.title === "string" ? body.title.trim() : ""
    const rawSlugSource =
      typeof body.slug === "string" && body.slug.trim().length > 0 ? body.slug.trim() : rawTitle
    const slug = slugify(rawSlugSource)
    const excerpt = typeof body.excerpt === "string" ? body.excerpt.trim() : ""
    const content = typeof body.content === "string" ? body.content.trim() : ""
    const category = typeof body.category === "string" ? body.category : ""
    const coverImage = typeof body.coverImage === "string" ? body.coverImage.trim() : ""
    const authorName = typeof body.authorName === "string" ? body.authorName.trim() : ""
    const authorAvatar = typeof body.authorAvatar === "string" ? body.authorAvatar.trim() : ""
    const published = Boolean(body.published)
    const providedReadTime =
      typeof body.readTime === "number" ? body.readTime : Number.parseInt(body.readTime, 10)

    if (!rawTitle) {
      return NextResponse.json({ message: "Title is required." }, { status: 400 })
    }

    if (!slug) {
      return NextResponse.json({ message: "Slug is required." }, { status: 400 })
    }

    if (!excerpt) {
      return NextResponse.json({ message: "Excerpt is required." }, { status: 400 })
    }

    if (!content) {
      return NextResponse.json({ message: "Content is required." }, { status: 400 })
    }

    if (!CATEGORY_VALUES.includes(category as BlogCategory)) {
      return NextResponse.json({ message: "Invalid category." }, { status: 400 })
    }

    const existingSlug = await findBlogPostBySlug(slug, false)
    if (existingSlug) {
      return NextResponse.json({ message: "Slug already exists. Please choose another." }, { status: 400 })
    }

    const now = new Date().toISOString()
    const tags = sanitiseTags(body.tags)
    const readTime =
      Number.isFinite(providedReadTime) && providedReadTime > 0 ? Math.round(providedReadTime) : estimateReadTime(content)

    const post = {
      id: `blog-${randomUUID()}`,
      title: rawTitle,
      slug,
      excerpt,
      content,
      coverImage,
      author: {
        name: authorName || "gelmanicure editorial",
        avatar: authorAvatar,
      },
      category: category as BlogCategory,
      tags,
      published,
      publishedAt: published ? now : "",
      createdAt: now,
      updatedAt: now,
      readTime,
    }

    await upsertBlogPost(post)
    revalidateBlogCache(post.slug)

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error("Admin blog create error", error)
    return NextResponse.json({ message: "Unable to create blog post." }, { status: 500 })
  }
}
