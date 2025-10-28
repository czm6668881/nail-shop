import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { requireAdminUser } from "@/lib/auth/session"
import { deleteBlogPost, listBlogPosts, upsertBlogPost, findBlogPostBySlug } from "@/lib/db/queries"
import { revalidateBlogCache } from "@/lib/cache"
import { slugify } from "@/lib/utils/slug"
import type { BlogCategory } from "@/types"

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

export async function GET(
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
    const posts = await listBlogPosts(false)
    const post = posts.find((item) => item.id === id)

    if (!post) {
      return NextResponse.json({ message: "Blog post not found." }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Admin blog get error", error)
    return NextResponse.json({ message: "Unable to load blog post." }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    await requireAdminUser(cookies())
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const posts = await listBlogPosts(false)
    const existing = posts.find((item) => item.id === id)

    if (!existing) {
      return NextResponse.json({ message: "Blog post not found." }, { status: 404 })
    }

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

    if (slug !== existing.slug) {
      const slugOwner = await findBlogPostBySlug(slug, false)
      if (slugOwner && slugOwner.id !== id) {
        return NextResponse.json({ message: "Slug already exists. Please choose another." }, { status: 400 })
      }
    }

    const tags = sanitiseTags(body.tags)
    const now = new Date().toISOString()
    const readTime =
      Number.isFinite(providedReadTime) && providedReadTime > 0
        ? Math.round(providedReadTime)
        : estimateReadTime(content)

    const post = {
      id,
      title: rawTitle,
      slug,
      excerpt,
      content,
      coverImage,
      author: {
        name: authorName || existing.author.name,
        avatar: authorAvatar || existing.author.avatar,
      },
      category: category as BlogCategory,
      tags,
      published,
      publishedAt: published ? existing.publishedAt || now : "",
      createdAt: existing.createdAt,
      updatedAt: now,
      readTime,
    }

    await upsertBlogPost(post)
    revalidateBlogCache(post.slug)
    if (existing.slug !== post.slug) {
      revalidateBlogCache(existing.slug)
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Admin blog update error", error)
    return NextResponse.json({ message: "Unable to update blog post." }, { status: 500 })
  }
}

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
    const posts = await listBlogPosts(false)
    const post = posts.find((item) => item.id === id)
    if (!post) {
      return NextResponse.json({ message: "Blog post not found." }, { status: 404 })
    }

    await deleteBlogPost(id)
    revalidateBlogCache(post.slug)
    return NextResponse.json({ message: "Blog post deleted." })
  } catch (error) {
    console.error("Admin blog delete error", error)
    return NextResponse.json({ message: "Unable to delete blog post." }, { status: 500 })
  }
}
