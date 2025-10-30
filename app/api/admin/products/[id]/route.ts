import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { requireAdminUser } from "@/lib/auth/session"
import { findProductById, upsertProduct, deleteProduct, findProductCategoryBySlug } from "@/lib/db/queries"
import { revalidateProductCache } from "@/lib/cache"
import type { Product } from "@/types"

const VALID_SIZES = ["XS", "S", "M", "L", "XL"] as const

const normalizeSizes = (input: unknown): string[] => {
  if (!Array.isArray(input)) {
    return []
  }
  const deduped = new Set<string>()
  input.forEach((value) => {
    if (typeof value === "string") {
      const normalized = value.toUpperCase().trim()
      if (VALID_SIZES.includes(normalized as typeof VALID_SIZES[number])) {
        deduped.add(normalized)
      }
    }
  })
  return Array.from(deduped)
}

const normalizeSizeLengths = (input: unknown, activeSizes: string[]): Record<string, number> => {
  if (!input || typeof input !== "object") {
    return {}
  }
  const sizeSet = new Set(activeSizes)
  return Object.entries(input as Record<string, unknown>).reduce<Record<string, number>>((acc, [size, value]) => {
    if (!sizeSet.has(size)) {
      return acc
    }
    const numeric = typeof value === "number" ? value : Number(value)
    if (Number.isFinite(numeric) && numeric > 0) {
      acc[size] = Number(numeric)
    }
    return acc
  }, {})
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminUser(cookies())
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const product = await findProductById(id)
    
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Admin get product error", error)
    return NextResponse.json({ message: "Unable to load product." }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminUser(cookies())
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const existing = await findProductById(id)

    if (!body.category || typeof body.category !== "string") {
      return NextResponse.json({ message: "Category is required." }, { status: 400 })
    }

    const category = await findProductCategoryBySlug(body.category)
    if (!category) {
      return NextResponse.json({ message: "Category does not exist." }, { status: 400 })
    }

    const sizes = normalizeSizes(body.sizes)
    const sizeLengths = normalizeSizeLengths(body.sizeLengths, sizes)
    const product = {
      id,
      name: body.name,
      description: body.description,
      price: Number(body.price),
      compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : undefined,
      images: body.images || [],
      category: category.slug,
      collection: body.collection || undefined,
      inStock: Boolean(body.inStock),
      stockQuantity: Number(body.stockQuantity),
      sizes: sizes as Product["sizes"],
      sizeLengths: (Object.keys(sizeLengths).length > 0 ? sizeLengths : undefined) as Product["sizeLengths"],
      features: body.features || [],
      application: body.application,
      materials: body.materials || [],
      slug: body.slug,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      featured: Boolean(body.featured),
      rating: Number(body.rating) || 0,
      reviewCount: Number(body.reviewCount) || 0,
    }

    await upsertProduct(product)
    revalidateProductCache({ slug: product.slug })

    if (existing && existing.slug !== product.slug) {
      revalidateProductCache({ slug: existing.slug })
    }

    return NextResponse.json({ product, message: "Product updated successfully" })
  } catch (error) {
    console.error("Admin update product error", error)
    return NextResponse.json({ message: "Unable to update product." }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminUser(cookies())
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const existing = await findProductById(id)

    await deleteProduct(id)
    if (existing?.slug) {
      revalidateProductCache({ slug: existing.slug })
    } else {
      revalidateProductCache()
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Admin delete product error", error)
    return NextResponse.json({ message: "Unable to delete product." }, { status: 500 })
  }
}









