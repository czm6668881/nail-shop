"use server"

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { requireAdminUser } from "@/lib/auth/session"
import {
  deleteProductCategory,
  findProductCategoryById,
  findProductCategoryBySlug,
  updateProductCategory,
} from "@/lib/db/queries"
import { revalidateCategoryCache } from "@/lib/cache"
import { slugify } from "@/lib/utils/slug"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdminUser(cookies())
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const category = await findProductCategoryById(params.id)
    if (!category) {
      return NextResponse.json({ message: "Category not found." }, { status: 404 })
    }

    const body = await request.json()
    const updates: {
      name?: string
      slug?: string
      description?: string | null
      sortOrder?: number
    } = {}

    if (typeof body.name === "string") {
      const name = body.name.trim()
      if (!name) {
        return NextResponse.json({ message: "Category name cannot be empty." }, { status: 400 })
      }
      updates.name = name
    }

    if (typeof body.slug === "string") {
      const nextSlug = slugify(body.slug)
      if (!nextSlug) {
        return NextResponse.json({ message: "Category slug cannot be empty." }, { status: 400 })
      }
      if (nextSlug !== category.slug) {
        const existingSlug = await findProductCategoryBySlug(nextSlug)
        if (existingSlug && existingSlug.id !== category.id) {
          return NextResponse.json({ message: "A category with this slug already exists." }, { status: 409 })
        }
      }
      updates.slug = nextSlug
    }

    if (typeof body.description === "string") {
      updates.description = body.description.trim().length > 0 ? body.description.trim() : null
    } else if (body.description === null) {
      updates.description = null
    }

    if (typeof body.sortOrder === "number") {
      updates.sortOrder = body.sortOrder
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: "No changes provided." }, { status: 400 })
    }

    const updatedCategory = await updateProductCategory(category.id, updates)
    if (!updatedCategory) {
      return NextResponse.json({ message: "Unable to update category." }, { status: 500 })
    }

    revalidateCategoryCache()

    return NextResponse.json({ category: updatedCategory, message: "Category updated successfully." })
  } catch (error) {
    console.error("Admin update category error", error)
    return NextResponse.json({ message: "Unable to update category." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdminUser(cookies())
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await deleteProductCategory(params.id)
    if (!result.success) {
      if (result.reason === "CATEGORY_IN_USE") {
        return NextResponse.json(
          { message: "Cannot delete category because it is used by existing products." },
          { status: 400 },
        )
      }
      return NextResponse.json({ message: "Unable to delete category." }, { status: 400 })
    }

    revalidateCategoryCache()

    return NextResponse.json({ message: "Category deleted successfully." })
  } catch (error) {
    console.error("Admin delete category error", error)
    return NextResponse.json({ message: "Unable to delete category." }, { status: 500 })
  }
}
