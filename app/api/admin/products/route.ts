import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { requireAdminUser } from "@/lib/auth/session"
import { listProducts, upsertProduct, findProductCategoryBySlug } from "@/lib/db/queries"
import { randomUUID } from "crypto"
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

export async function GET() {
  try {
    await requireAdminUser(cookies())
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const products = await listProducts()
    return NextResponse.json({ products })
  } catch (error) {
    console.error("Admin products list error", error)
    return NextResponse.json({ message: "Unable to load products." }, { status: 500 })
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
      id: `product-${randomUUID()}`,
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
      application: body.application || "",
      materials: body.materials || [],
      slug: body.slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      featured: Boolean(body.featured),
      rating: 0,
      reviewCount: 0,
    }

    await upsertProduct(product)
    revalidateProductCache({ slug: product.slug })
    return NextResponse.json({ product, message: "Product created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Admin create product error", error)
    return NextResponse.json({ message: "Unable to create product." }, { status: 500 })
  }
}

