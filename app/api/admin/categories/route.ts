"use server"

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { randomUUID } from "crypto"
import { requireAdminUser } from "@/lib/auth/session"
import {
  listProductCategories,
  createProductCategory,
  findProductCategoryBySlug,
} from "@/lib/db/queries"
import { revalidateCategoryCache } from "@/lib/cache"
import { slugify } from "@/lib/utils/slug"

export async function GET() {
  try {
    await requireAdminUser(cookies())
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const categories = await listProductCategories()
    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Admin categories list error", error)
    return NextResponse.json({ message: "Unable to load categories." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminUser(cookies())
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const name = typeof body.name === "string" ? body.name.trim() : ""
    if (!name) {
      return NextResponse.json({ message: "Category name is required." }, { status: 400 })
    }

    const rawSlug = typeof body.slug === "string" && body.slug.trim().length > 0 ? body.slug : name
    const slug = slugify(rawSlug)
    if (!slug) {
      return NextResponse.json({ message: "Category slug could not be generated." }, { status: 400 })
    }

    const existing = await findProductCategoryBySlug(slug)
    if (existing) {
      return NextResponse.json({ message: "A category with this slug already exists." }, { status: 409 })
    }

    const category = await createProductCategory({
      id: `category-${randomUUID()}`,
      name,
      slug,
      description: typeof body.description === "string" ? body.description.trim() : null,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : undefined,
    })

    revalidateCategoryCache()

    return NextResponse.json({ category, message: "Category created successfully." }, { status: 201 })
  } catch (error) {
    console.error("Admin create category error", error)
    return NextResponse.json({ message: "Unable to create category." }, { status: 500 })
  }
}
