import { createClient } from "@supabase/supabase-js"
import { randomUUID } from "crypto"
import type { Database } from "@/types/database"
import { collections as seedCollections, products as seedProducts } from "@/lib/data/products"
import { mockAddresses, mockBlogPosts, mockOrders, mockReviews } from "@/lib/data/mock-data"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRole) {
  throw new Error("Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
}

const supabase = createClient<Database>(url, serviceRole, {
  auth: { persistSession: false },
  global: { headers: { "X-Client-Info": "nail-shop/seed-script" } },
})

const nowIso = () => new Date().toISOString()

async function seedUsers() {
  const { data: admin } = await supabase.from("users").select("id").eq("email", "admin@luxenails.com").maybeSingle()
  if (!admin) {
    await supabase.from("users").upsert([
      {
        id: `user-${randomUUID()}`,
        email: "admin@luxenails.com",
        password_hash: "$2a$10$LJbwIG8PCnPfNaI8.DaHdObse50TLoYWEAyAk2B11D1OaU91KtZO2", // Admin123!
        first_name: "Admin",
        last_name: "User",
        avatar: "/placeholder.svg?height=100&width=100",
        role: "admin",
        created_at: nowIso(),
      },
      {
        id: `user-${randomUUID()}`,
        email: "customer@luxenails.com",
        password_hash: "$2a$10$z2cAaL45eLmDXoS9EBIXUumeZttvnD.TDy7mwRXogPttRnb9KPP7m", // Customer123!
        first_name: "Emma",
        last_name: "Wilson",
        avatar: "/placeholder.svg?height=100&width=100",
        role: "customer",
        created_at: nowIso(),
      },
    ])
  }
}

async function seedCollections() {
  const payload = seedCollections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    description: collection.description ?? null,
    slug: collection.slug,
    image: collection.image ?? null,
    product_count: collection.productCount,
    featured: collection.featured,
  }))

  await supabase.from("collections").upsert(payload, { onConflict: "id" })
}

async function seedProducts() {
  const collectionSlugByName = new Map(seedCollections.map((collection) => [collection.name, collection.slug]))

  const payload = seedProducts.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    compare_at_price: product.compareAtPrice ?? null,
    images: product.images,
    category: product.category,
    collection_slug: product.collection ? collectionSlugByName.get(product.collection) ?? null : null,
    in_stock: product.inStock,
    stock_quantity: product.stockQuantity,
    sizes: product.sizes,
    features: product.features,
    application: product.application,
    materials: product.materials,
    slug: product.slug,
    created_at: product.createdAt,
    updated_at: product.updatedAt,
    featured: product.featured,
    rating: product.rating,
    review_count: product.reviewCount,
  }))

  await supabase.from("products").upsert(payload, { onConflict: "id" })
}

async function seedReviews() {
  if (mockReviews.length === 0) return
  const payload = mockReviews.map((review) => ({
    id: review.id,
    product_id: review.productId,
    user_id: review.userId === "" ? null : review.userId,
    user_name: review.userName,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    images: review.images ?? [],
    verified: review.verified,
    created_at: review.createdAt,
  }))
  await supabase.from("reviews").upsert(payload, { onConflict: "id" })
}

async function seedBlogPosts() {
  if (mockBlogPosts.length === 0) return
  const payload = mockBlogPosts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    cover_image: post.coverImage ?? null,
    author_name: post.author.name,
    author_avatar: post.author.avatar ?? null,
    category: post.category,
    tags: post.tags,
    published: post.published,
    published_at: post.publishedAt || null,
    created_at: post.createdAt,
    updated_at: post.updatedAt,
    read_time: post.readTime,
  }))
  await supabase.from("blog_posts").upsert(payload, { onConflict: "id" })
}

async function seedOrders() {
  if (mockOrders.length === 0) return
  const payload = mockOrders.map((order) => ({
    id: order.id,
    user_id: order.userId,
    order_number: order.orderNumber,
    items: order.items,
    subtotal: order.subtotal,
    tax: order.tax,
    shipping: order.shipping,
    total: order.total,
    status: order.status,
    shipping_address: order.shippingAddress,
    billing_address: order.billingAddress,
    payment_method: order.paymentMethod,
    tracking_number: order.trackingNumber ?? null,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  }))
  await supabase.from("orders").upsert(payload, { onConflict: "id" })
}

async function seedAddresses() {
  if (mockAddresses.length === 0) return
  const payload = mockAddresses.map((address) => ({
    id: address.id,
    user_id: address.userId,
    first_name: address.firstName,
    last_name: address.lastName,
    address_line1: address.addressLine1,
    address_line2: address.addressLine2 ?? null,
    city: address.city,
    state: address.state,
    postal_code: address.postalCode,
    country: address.country,
    phone: address.phone,
    is_default: address.isDefault,
    created_at: nowIso(),
    updated_at: nowIso(),
  }))
  await supabase.from("addresses").upsert(payload, { onConflict: "id" })
}

async function run() {
  await seedUsers()
  await seedCollections()
  await seedProducts()
  await seedReviews()
  await seedBlogPosts()
  await seedOrders()
  await seedAddresses()
  console.log("✅ Supabase seed completed.")
}

run().catch((error) => {
  console.error("Supabase seed failed", error)
  process.exitCode = 1
})
