import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { requireAdminUser } from "@/lib/auth/session"
import { listProducts, upsertProduct } from "@/lib/db/queries"
import { randomUUID } from "crypto"

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
    
    const product = {
      id: `product-${randomUUID()}`,
      name: body.name,
      description: body.description,
      price: Number(body.price),
      compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : undefined,
      images: body.images || [],
      category: body.category,
      collection: body.collection || undefined,
      inStock: Boolean(body.inStock),
      stockQuantity: Number(body.stockQuantity),
      sizes: body.sizes || [],
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
    return NextResponse.json({ product, message: "Product created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Admin create product error", error)
    return NextResponse.json({ message: "Unable to create product." }, { status: 500 })
  }
}
