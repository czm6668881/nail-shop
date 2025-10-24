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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminUser(cookies())
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const category = await findProductCategoryById(id)
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

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminUser(cookies())
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const result = await deleteProductCategory(id)
    if (!result.success) {
      if (result.reason === "CATEGORY_IN_USE") {
        return NextResponse.json(
          {
            message: "该分类仍在被商品使用，无法直接删除。请先在商品管理中修改这些商品的分类，然后再尝试删除。",
            reason: "CATEGORY_IN_USE",
          },
          { status: 409 },
        )
      }
      return NextResponse.json({ message: "删除分类失败，请稍后重试。" }, { status: 400 })
    }

    revalidateCategoryCache()

    return NextResponse.json({ message: "Category deleted successfully." })
  } catch (error) {
    console.error("Admin delete category error", error)
    return NextResponse.json({ message: "Unable to delete category." }, { status: 500 })
  }
}
