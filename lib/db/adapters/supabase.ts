import { randomBytes, randomUUID, createHash } from "crypto"
import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js"
import type {
  Product,
  Review,
  BlogPost,
  Cart,
  CartItem,
  NailSize,
  User,
  Order,
  Address,
  WishlistItem,
  SupportTicket,
  ReturnRequest,
  NotificationPreferences,
  ProductCategory,
  SiteSetting,
} from "@/types"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { Database, Json } from "@/types/database"
import { InventoryError } from "@/lib/db/errors"

const supabase = (): SupabaseClient<Database> => getSupabaseAdminClient()

type Tables = Database["public"]["Tables"]
type ProductRow = Tables["products"]["Row"]
type ReviewRow = Tables["reviews"]["Row"]
type BlogPostRow = Tables["blog_posts"]["Row"]
type CartRow = Tables["carts"]["Row"]
type CartItemRow = Tables["cart_items"]["Row"]
type OrderRow = Tables["orders"]["Row"]
type AddressRow = Tables["addresses"]["Row"]
type WishlistItemRow = Tables["wishlist_items"]["Row"]
type NotificationPreferenceRow = Tables["notification_preferences"]["Row"]
type SessionRow = Tables["sessions"]["Row"]
type UserRow = Tables["users"]["Row"]
type ProductCategoryRow = Tables["product_categories"]["Row"]
type SiteSettingRow = Tables["site_settings"]["Row"]
type SiteSettingInsert = Tables["site_settings"]["Insert"]

const GOOGLE_ID_COLUMN = "google_id"

let googleIdColumnAvailable: boolean | undefined
let googleIdColumnCheckPromise: Promise<boolean> | undefined
let loggedMissingGoogleIdWarning = false

const parseInventoryMeta = (details?: string | null): Record<string, unknown> | undefined => {
  if (!details) {
    return undefined
  }
  try {
    const parsed = JSON.parse(details)
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>
    }
    return { raw: details }
  } catch {
    return { raw: details }
  }
}

const handleInventoryPostgrestError = (error: PostgrestError) => {
  if (error.code === "P0001" && error.message === "Insufficient stock") {
    throw new InventoryError("INSUFFICIENT_STOCK", "Insufficient stock. Adjust the quantity and try again.", parseInventoryMeta(error.details))
  }

  if (error.code === "P0002" && error.message === "Product not found") {
    throw new InventoryError("PRODUCT_NOT_FOUND", "The requested product does not exist or is no longer available.", parseInventoryMeta(error.details))
  }
}

const warnMissingGoogleIdColumn = () => {
  if (!loggedMissingGoogleIdWarning) {
    console.warn(
      "[google-oauth] Supabase users table is missing the google_id column; falling back to email-based user linking.",
    )
    loggedMissingGoogleIdWarning = true
  }
}

const isMissingGoogleIdColumnError = (error: unknown): error is PostgrestError & { code: string } => {
  if (!error || typeof error !== "object") {
    return false
  }
  const code = (error as PostgrestError).code
  return code === "42703"
}

const ensureGoogleIdColumnAvailable = async (): Promise<boolean> => {
  if (typeof googleIdColumnAvailable !== "undefined") {
    return googleIdColumnAvailable
  }

  if (!googleIdColumnCheckPromise) {
    googleIdColumnCheckPromise = (async () => {
      const { error } = await supabase().from("users").select(GOOGLE_ID_COLUMN).limit(1)
      if (error) {
        if (isMissingGoogleIdColumnError(error)) {
          warnMissingGoogleIdColumn()
          googleIdColumnAvailable = false
          return false
        }
        throw error
      }

      googleIdColumnAvailable = true
      return true
    })().catch((error) => {
      googleIdColumnCheckPromise = undefined
      throw error
    })
  }

  return googleIdColumnCheckPromise
}

const jsonArray = <T>(value: Json | null | undefined, fallback: T): T => {
  if (Array.isArray(value)) {
    return value as T
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T
    } catch {
      return fallback
    }
  }
  return fallback
}

const jsonObject = <T>(value: Json | null | undefined, fallback: T): T => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as T
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T
    } catch {
      return fallback
    }
  }
  return fallback
}

const mapProduct = (row: ProductRow & { category_label?: string | null }): Product => ({
  id: row.id,
  name: row.name,
  description: row.description ?? "",
  price: row.price,
  compareAtPrice: row.compare_at_price ?? undefined,
  images: jsonArray<string[]>(row.images, []),
  category: (row.category ?? "") as Product["category"],
  categoryLabel: row.category_label ?? undefined,
  collection: row.collection_slug ?? undefined,
  inStock: row.in_stock,
  stockQuantity: row.stock_quantity,
  sizes: jsonArray<NailSize[]>(row.sizes, []),
  features: jsonArray<string[]>(row.features, []),
  application: row.application ?? "",
  materials: jsonArray<string[]>(row.materials, []),
  slug: row.slug,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  featured: row.featured,
  rating: row.rating,
  reviewCount: row.review_count,
})

const mapProductCategory = (row: ProductCategoryRow): ProductCategory => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description ?? undefined,
  sortOrder: row.sort_order ?? 0,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const mapSiteSetting = (row: SiteSettingRow): SiteSetting => ({
  key: row.key,
  value: row.value,
  updatedAt: row.updated_at ?? new Date().toISOString(),
})

const mapReview = (row: ReviewRow): Review => ({
  id: row.id,
  productId: row.product_id,
  userId: row.user_id ?? "",
  userName: row.user_name,
  rating: row.rating,
  title: row.title,
  comment: row.comment,
  images: jsonArray<string[]>(row.images, []),
  verified: row.verified,
  createdAt: row.created_at,
})

const mapBlogPost = (row: BlogPostRow): BlogPost => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  excerpt: row.excerpt,
  content: row.content,
  coverImage: row.cover_image ?? "",
  author: {
    name: row.author_name,
    avatar: row.author_avatar ?? "",
  },
  category: row.category as BlogPost["category"],
  tags: jsonArray<string[]>(row.tags, []),
  published: row.published,
  publishedAt: row.published_at ?? "",
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  readTime: row.read_time,
})

const mapCartItem = (row: CartItemRow, product: Product): CartItem => ({
  id: row.id,
  productId: row.product_id,
  product,
  quantity: row.quantity,
  size: row.size as NailSize,
  addedAt: row.added_at,
})

const mapCart = (cart: CartRow, items: CartItem[]): Cart => {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const tax = Number((subtotal * 0.09).toFixed(2))
  const shipping = 0 // Free worldwide shipping
  const total = Number((subtotal + tax + shipping).toFixed(2))

  return {
    id: cart.id,
    items,
    subtotal,
    tax,
    shipping,
    total,
    updatedAt: cart.updated_at,
  }
}

const mapOrder = (row: OrderRow, email?: string): Order => ({
  id: row.id,
  userId: row.user_id ?? "guest",
  email,
  orderNumber: row.order_number,
  items: jsonArray<Order["items"]>(row.items, []),
  subtotal: row.subtotal,
  tax: row.tax,
  shipping: row.shipping,
  total: row.total,
  status: row.status as Order["status"],
  shippingAddress: jsonObject<Order["shippingAddress"]>(row.shipping_address, {
    id: "",
    userId: "",
    firstName: "",
    lastName: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
    isDefault: false,
  }),
  billingAddress: jsonObject<Order["billingAddress"]>(row.billing_address, {
    id: "",
    userId: "",
    firstName: "",
    lastName: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
    isDefault: false,
  }),
  paymentMethod: row.payment_method,
  trackingNumber: row.tracking_number ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

type UserEmailRow = Pick<UserRow, "id" | "email">

const fetchUserEmails = async (userIds: string[]): Promise<Map<string, string>> => {
  const uniqueIds = Array.from(
    new Set(
      userIds.filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  )
  if (uniqueIds.length === 0) {
    return new Map()
  }

  const { data, error } = await supabase()
    .from("users")
    .select("id, email")
    .in("id", uniqueIds)
  if (error) {
    throw error
  }

  const rows: UserEmailRow[] = (data ?? []) as UserEmailRow[]
  const map = new Map<string, string>()
  for (const row of rows) {
    if (typeof row.id === "string" && typeof row.email === "string") {
      map.set(row.id, row.email)
    }
  }
  return map
}

export const deleteOrder = async (orderId: string) => {
  const client = supabase()
  const { error: inventoryError } = await client
    .from("inventory_events")
    .delete()
    .eq("reference_type", "order")
    .eq("reference_id", orderId)
  if (inventoryError) {
    throw inventoryError
  }

  const { data, error } = await client.from("orders").delete().eq("id", orderId).select("id").maybeSingle()
  if (error) {
    throw error
  }
  if (!data) {
    throw new Error("ORDER_NOT_FOUND")
  }
}

export const deleteAllOrders = async () => {
  const client = supabase()
  const { error: inventoryError } = await client.from("inventory_events").delete().eq("reference_type", "order")
  if (inventoryError) {
    throw inventoryError
  }
  const { error } = await client.from("orders").delete()
  if (error) {
    throw error
  }
}

const mapAddress = (row: AddressRow): Address => ({
  id: row.id,
  userId: row.user_id,
  firstName: row.first_name,
  lastName: row.last_name,
  addressLine1: row.address_line1,
  addressLine2: row.address_line2 ?? undefined,
  city: row.city,
  state: row.state,
  postalCode: row.postal_code,
  country: row.country,
  phone: row.phone,
  isDefault: row.is_default,
})

const mapWishlistItem = (row: WishlistItemRow, product: Product): WishlistItem => ({
  id: row.id,
  userId: row.user_id,
  productId: row.product_id,
  product,
  addedAt: row.added_at,
})

const mapNotificationPreferences = (row: NotificationPreferenceRow): NotificationPreferences => ({
  marketingEmails: row.marketing_emails,
  productAlerts: row.product_alerts,
  smsUpdates: row.sms_updates,
})

const mapPublicUserRow = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  firstName: row.first_name,
  lastName: row.last_name,
  avatar: row.avatar ?? "",
  role: row.role,
  createdAt: row.created_at,
})

type InternalUser = User & { passwordHash: string; googleId: string | null }

const mapUserWithPassword = (row: UserRow): InternalUser => ({
  id: row.id,
  email: row.email,
  firstName: row.first_name,
  lastName: row.last_name,
  avatar: row.avatar ?? undefined,
  createdAt: row.created_at,
  role: row.role,
  passwordHash: row.password_hash,
  googleId: row.google_id ?? null,
})

export const toPublicUser = (user: InternalUser): User => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  avatar: user.avatar,
  createdAt: user.createdAt,
  role: user.role,
})

export const listProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase()
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map(mapProduct)
}

export const findProductBySlug = async (slug: string): Promise<Product | null> => {
  const { data, error } = await supabase()
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data ? mapProduct(data) : null
}

export const findProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase()
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data ? mapProduct(data) : null
}

export const listFeaturedProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase()
    .from("products")
    .select("*")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(12)

  if (error) {
    throw error
  }

  return (data ?? []).map(mapProduct)
}

export const listProductsByCategory = async (category: string): Promise<Product[]> => {
  const { data, error } = await supabase()
    .from("products")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map(mapProduct)
}

export const searchProductsByQuery = async (query: string): Promise<Product[]> => {
  const lowercase = query.toLowerCase()
  const { data, error } = await supabase()
    .from("products")
    .select("*")
    .or(
      `name.ilike.%${lowercase}%,description.ilike.%${lowercase}%,category.ilike.%${lowercase}%`,
    )
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map(mapProduct)
}

export const listProductCategories = async (): Promise<ProductCategory[]> => {
  const { data, error } = await supabase()
    .from("product_categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []).map(mapProductCategory)
}

export const findProductCategoryById = async (id: string): Promise<ProductCategory | null> => {
  const { data, error } = await supabase()
    .from("product_categories")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data ? mapProductCategory(data) : null
}

export const findProductCategoryBySlug = async (slug: string): Promise<ProductCategory | null> => {
  const { data, error } = await supabase()
    .from("product_categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data ? mapProductCategory(data) : null
}

export const createProductCategory = async (category: {
  id: string
  name: string
  slug: string
  description?: string | null
  sortOrder?: number
}): Promise<ProductCategory> => {
  let sortOrder = category.sortOrder

  if (typeof sortOrder !== "number") {
    const { data: maxRow, error: maxError } = await supabase()
      .from("product_categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle<{ sort_order: number | null }>()

    if (maxError && maxError.code !== "PGRST116") {
      throw maxError
    }

    sortOrder = (maxRow?.sort_order ?? 0) + 1
  }

  const now = new Date().toISOString()
  const payload: Tables["product_categories"]["Insert"] = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? null,
    sort_order: sortOrder,
    created_at: now,
    updated_at: now,
  }

  const { error } = await supabase().from("product_categories").insert(payload as never)
  if (error) {
    throw error
  }

  return mapProductCategory({
    id: payload.id!,
    name: payload.name!,
    slug: payload.slug!,
    description: payload.description ?? null,
    sort_order: payload.sort_order ?? 0,
    created_at: payload.created_at ?? now,
    updated_at: payload.updated_at ?? now,
  })
}

export const updateProductCategory = async (
  id: string,
  updates: {
    name?: string
    slug?: string
    description?: string | null
    sortOrder?: number
  },
): Promise<ProductCategory | null> => {
  const existing = await findProductCategoryById(id)
  if (!existing) {
    return null
  }

  const nextSlug = updates.slug ?? existing.slug
  const slugChanged = nextSlug !== existing.slug

  const payload: Tables["product_categories"]["Update"] = {
    name: updates.name ?? existing.name,
    slug: nextSlug,
    description: typeof updates.description === "undefined" ? existing.description ?? null : updates.description,
    sort_order: typeof updates.sortOrder === "number" ? updates.sortOrder : existing.sortOrder,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase().from("product_categories").update(payload as never).eq("id", id)
  if (error) {
    throw error
  }

  if (slugChanged) {
    const { error: productUpdateError } = await supabase()
      .from("products")
      .update({ category: nextSlug } as never)
      .eq("category", existing.slug)
    if (productUpdateError) {
      throw productUpdateError
    }
  }

  return {
    id,
    name: payload.name ?? existing.name,
    slug: payload.slug ?? existing.slug,
    description:
      typeof updates.description === "undefined" ? existing.description : updates.description ?? undefined,
    sortOrder: payload.sort_order ?? existing.sortOrder,
    createdAt: existing.createdAt,
    updatedAt: payload.updated_at ?? new Date().toISOString(),
  }
}

export const deleteProductCategory = async (
  id: string,
): Promise<{ success: true } | { success: false; reason: "CATEGORY_IN_USE" }> => {
  const existing = await findProductCategoryById(id)
  if (!existing) {
    return { success: true }
  }

  const { count, error: countError } = await supabase()
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category", existing.slug)

  if (countError) {
    throw countError
  }

  if ((count ?? 0) > 0) {
    return { success: false, reason: "CATEGORY_IN_USE" }
  }

  const { error } = await supabase().from("product_categories").delete().eq("id", id)
  if (error) {
    throw error
  }

  return { success: true }
}

export const upsertProduct = async (product: Product): Promise<void> => {
  const payload: Tables["products"]["Insert"] = {
    id: product.id,
    name: product.name,
    description: product.description ?? null,
    price: product.price,
    compare_at_price: product.compareAtPrice ?? null,
    images: product.images as Json,
    category: product.category,
    collection_slug: product.collection ?? null,
    in_stock: product.inStock,
    stock_quantity: product.stockQuantity,
    sizes: product.sizes as Json,
    features: product.features as Json,
    application: product.application ?? null,
    materials: product.materials as Json,
    slug: product.slug,
    created_at: product.createdAt ?? new Date().toISOString(),
    updated_at: product.updatedAt ?? new Date().toISOString(),
    featured: product.featured,
    rating: product.rating,
    review_count: product.reviewCount,
  }

  const { error } = await supabase().from("products").upsert(payload as never)

  if (error) {
    throw error
  }
}

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase().from("products").delete().eq("id", id)

  if (error) {
    throw error
  }
}

export const toggleProductFeatured = async (id: string, featured: boolean): Promise<void> => {
  const updates: Tables["products"]["Update"] = {
    featured,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase().from("products").update(updates as never)
    .eq("id", id)

  if (error) {
    throw error
  }
}

export const listReviews = async (): Promise<Review[]> => {
  const { data, error } = await supabase().from("reviews").select("*").order("created_at", { ascending: false })
  if (error) {
    throw error
  }
  return (data ?? []).map(mapReview)
}

export const listReviewsByProductId = async (productId: string): Promise<Review[]> => {
  const { data, error } = await supabase()
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
  if (error) {
    throw error
  }
  return (data ?? []).map(mapReview)
}

export const listFeaturedReviews = async (limit: number): Promise<Review[]> => {
  const { data, error } = await supabase()
    .from("reviews")
    .select("*")
    .eq("verified", true)
    .not("images", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) {
    throw error
  }
  return (data ?? []).map(mapReview)
}

export const listBlogPosts = async (publishedOnly = true): Promise<BlogPost[]> => {
  const client = supabase().from("blog_posts").select("*")
  if (publishedOnly) {
    client.eq("published", true).order("published_at", { ascending: false })
  } else {
    client.order("created_at", { ascending: false })
  }
  const { data, error } = await client
  if (error) {
    throw error
  }
  return (data ?? []).map(mapBlogPost)
}

export const findBlogPostBySlug = async (slug: string, publishedOnly = true): Promise<BlogPost | null> => {
  const client = supabase().from("blog_posts").select("*").eq("slug", slug).limit(1)
  if (publishedOnly) {
    client.eq("published", true)
  }
  const { data, error } = await client.maybeSingle()
  if (error) {
    throw error
  }
  return data ? mapBlogPost(data) : null
}

export const listRelatedBlogPosts = async (postId: string, limit = 3): Promise<BlogPost[]> => {
  const { data: post, error: postError } = await supabase()
    .from("blog_posts")
    .select("category")
    .eq("id", postId)
    .maybeSingle<{ category: BlogPost["category"] }>()

  if (postError) {
    throw postError
  }

  if (!post) {
    return []
  }

  const { data, error } = await supabase()
    .from("blog_posts")
    .select("*")
    .eq("category", post.category)
    .neq("id", postId)
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(limit)

  if (error) {
    throw error
  }

  return (data ?? []).map(mapBlogPost)
}

export const upsertBlogPost = async (post: BlogPost) => {
  const payload: Tables["blog_posts"]["Insert"] = {
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
  }

  const { error } = await supabase().from("blog_posts").upsert(payload as never, { onConflict: "id" })
  if (error) {
    throw error
  }
}

export const deleteBlogPost = async (id: string) => {
  const { error } = await supabase().from("blog_posts").delete().eq("id", id)
  if (error) {
    throw error
  }
}

export const toggleBlogPublish = async (id: string, published: boolean) => {
  const now = new Date().toISOString()
  const { error } = await supabase()
    .from("blog_posts")
    .update(
      {
        published,
        updated_at: now,
        published_at: published ? now : null,
      } as never,
    )
    .eq("id", id)
  if (error) {
    throw error
  }
}

export const listOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase().from("orders").select("*").order("created_at", { ascending: false })
  if (error) {
    throw error
  }
  const rows = (data ?? []) as OrderRow[]
  const emailMap = await fetchUserEmails(rows.map((row) => row.user_id ?? ""))
  return rows.map((row) => mapOrder(row, row.user_id ? emailMap.get(row.user_id) : undefined))
}

export const listOrdersByUser = async (userId: string): Promise<Order[]> => {
  const { data, error } = await supabase()
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (error) {
    throw error
  }
  const rows = (data ?? []) as OrderRow[]
  const emailMap = await fetchUserEmails(rows.map((row) => row.user_id ?? ""))
  return rows.map((row) => mapOrder(row, row.user_id ? emailMap.get(row.user_id) : undefined))
}

export const insertOrder = async (order: Order) => {
  const payload: Tables["orders"]["Insert"] = {
    id: order.id,
    user_id: order.userId ?? null,
    order_number: order.orderNumber,
    items: order.items as unknown as Json,
    subtotal: order.subtotal,
    tax: order.tax,
    shipping: order.shipping,
    total: order.total,
    status: order.status,
    shipping_address: order.shippingAddress as unknown as Json,
    billing_address: order.billingAddress as unknown as Json,
    payment_method: order.paymentMethod,
    tracking_number: order.trackingNumber ?? null,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  }

  const { error } = await supabase().from("orders").insert(payload as never)
  if (error) {
    handleInventoryPostgrestError(error)
    throw error
  }
}

export const updateOrderTrackingNumber = async (orderId: string, trackingNumber: string | null): Promise<Order> => {
  const now = new Date().toISOString()
  const updatePayload: Tables["orders"]["Update"] = {
    tracking_number: trackingNumber ?? null,
    updated_at: now,
  }
  const { data, error } = await supabase()
    .from("orders")
    .update(updatePayload as never)
    .eq("id", orderId)
    .select("*")
    .maybeSingle<OrderRow>()

  if (error) {
    throw error
  }

  if (!data) {
    throw new Error("ORDER_NOT_FOUND")
  }

  const row = data as OrderRow
  const emailMap = await fetchUserEmails(row.user_id ? [row.user_id] : [])
  const email = row.user_id ? emailMap.get(row.user_id) : undefined
  return mapOrder(row, email)
}

export const ensureCart = async (
  cartId?: string,
  userId?: string,
): Promise<{ cart: CartRow; newlyCreated: boolean }> => {
  if (cartId) {
    const { data, error } = await supabase().from("carts").select("*").eq("id", cartId).maybeSingle()
    if (error) {
      throw error
    }
    if (data) {
      return { cart: data, newlyCreated: false }
    }
  }

  const timestamp = new Date().toISOString()
  const newCart: Tables["carts"]["Insert"] = {
    id: `cart-${randomUUID()}`,
    user_id: userId ?? null,
    created_at: timestamp,
    updated_at: timestamp,
  }

  const { data, error } = await supabase().from("carts").insert(newCart as never).select("*").single()
  if (error) {
    throw error
  }

  return { cart: data, newlyCreated: true }
}

export const fetchCart = async (cartId: string): Promise<Cart | null> => {
  const { data: cartRow, error: cartError } = await supabase()
    .from("carts")
    .select("*")
    .eq("id", cartId)
    .maybeSingle<CartRow>()
  if (cartError) {
    throw cartError
  }
  if (!cartRow) {
    return null
  }

  const { data: itemRows, error: itemError } = await supabase()
    .from("cart_items")
    .select("*")
    .eq("cart_id", cartId)
    .order("added_at", { ascending: false })
    .returns<CartItemRow[]>()

  if (itemError) {
    throw itemError
  }

  const items = await Promise.all(
    (itemRows ?? []).map(async (row) => {
      const product = await findProductById(row.product_id)
      if (!product) {
        return null
      }
      return mapCartItem(row, product)
    }),
  )

  return mapCart(
    cartRow,
    items.filter(Boolean) as CartItem[],
  )
}

export const upsertCartItem = async (args: {
  cartId: string
  productId: string
  size: string
  quantity: number
}): Promise<string> => {
  const { data: existing, error: existingError } = await supabase()
    .from("cart_items")
    .select("*")
    .eq("cart_id", args.cartId)
    .eq("product_id", args.productId)
    .eq("size", args.size)
    .maybeSingle<CartItemRow>()

  if (existingError) {
    throw existingError
  }

  const timestamp = new Date().toISOString()

  if (existing) {
    const newQuantity = existing.quantity + args.quantity
    const { error } = await supabase()
      .from("cart_items")
      .update({ quantity: newQuantity, added_at: timestamp } as never)
      .eq("id", existing.id)
    if (error) {
      throw error
    }
    return existing.id
  }

  const id = `item-${randomUUID()}`
  const { error } = await supabase()
    .from("cart_items")
    .insert({
      id,
      cart_id: args.cartId,
      product_id: args.productId,
      size: args.size,
      quantity: args.quantity,
      added_at: timestamp,
    } as never)
  if (error) {
    throw error
  }
  return id
}

export const updateCartItemQuantity = async (itemId: string, quantity: number) => {
  const { error } = await supabase()
    .from("cart_items")
    .update({ quantity, added_at: new Date().toISOString() } as never)
    .eq("id", itemId)
  if (error) {
    throw error
  }
}

export const removeCartItem = async (itemId: string) => {
  const { error } = await supabase().from("cart_items").delete().eq("id", itemId)
  if (error) {
    throw error
  }
}

export const clearCartItems = async (cartId: string) => {
  const { error } = await supabase().from("cart_items").delete().eq("cart_id", cartId)
  if (error) {
    throw error
  }
}

export const touchCart = async (cartId: string) => {
  const { error } = await supabase()
    .from("carts")
    .update({ updated_at: new Date().toISOString() } as never)
    .eq("id", cartId)
  if (error) {
    throw error
  }
}

export const listAddressesByUser = async (userId: string): Promise<Address[]> => {
  const { data, error } = await supabase()
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("updated_at", { ascending: false })
  if (error) {
    throw error
  }
  return (data ?? []).map(mapAddress)
}

export const createAddressForUser = async (
  userId: string,
  data: Omit<Address, "id" | "userId">,
): Promise<Address> => {
  const timestamp = new Date().toISOString()
  const id = `addr-${randomUUID()}`

  const { data: defaults, error: defaultsError } = await supabase()
    .from("addresses")
    .select("is_default")
    .eq("user_id", userId)
    .returns<{ is_default: boolean }[]>()

  if (defaultsError) {
    throw defaultsError
  }

  let shouldBeDefault = data.isDefault ?? false
  if (!shouldBeDefault && (defaults ?? []).every((row) => row.is_default === false)) {
    shouldBeDefault = true
  }

  if (shouldBeDefault) {
    const { error } = await supabase()
      .from("addresses")
      .update({ is_default: false } as never)
      .eq("user_id", userId)
    if (error) {
      throw error
    }
  }

  const insertPayload: Tables["addresses"]["Insert"] = {
    id,
    user_id: userId,
    first_name: data.firstName,
    last_name: data.lastName,
    address_line1: data.addressLine1,
    address_line2: data.addressLine2 ?? null,
    city: data.city,
    state: data.state,
    postal_code: data.postalCode,
    country: data.country,
    phone: data.phone,
    is_default: shouldBeDefault,
    created_at: timestamp,
    updated_at: timestamp,
  }

  const { data: inserted, error: insertError } = await supabase()
    .from("addresses")
    .insert(insertPayload as never)
    .select("*")
    .single()

  if (insertError || !inserted) {
    throw insertError ?? new Error("Unable to create address.")
  }

  return mapAddress(inserted)
}

export const setDefaultAddressForUser = async (userId: string, addressId: string) => {
  const { data: address, error: addrError } = await supabase()
    .from("addresses")
    .select("id")
    .eq("id", addressId)
    .eq("user_id", userId)
    .maybeSingle()
  if (addrError) {
    throw addrError
  }
  if (!address) {
    throw new Error("Address not found.")
  }

  const client = supabase()
  const { error: unsetError } = await client
    .from("addresses")
    .update({ is_default: false } as never)
    .eq("user_id", userId)
  if (unsetError) {
    throw unsetError
  }

  const { error } = await client
    .from("addresses")
    .update({ is_default: true, updated_at: new Date().toISOString() } as never)
    .eq("id", addressId)
  if (error) {
    throw error
  }
}

export const deleteAddressForUser = async (userId: string, addressId: string) => {
  const { data: address, error: fetchError } = await supabase()
    .from("addresses")
    .select("is_default")
    .eq("id", addressId)
    .eq("user_id", userId)
    .maybeSingle<{ is_default: boolean }>()
  if (fetchError) {
    throw fetchError
  }
  if (!address) {
    throw new Error("Address not found.")
  }

  const client = supabase()
  const { error: deleteError } = await client.from("addresses").delete().eq("id", addressId).eq("user_id", userId)
  if (deleteError) {
    throw deleteError
  }

  if (address.is_default) {
    const { data: nextDefault, error: nextError } = await client
      .from("addresses")
      .select("id")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ id: string }>()
    if (nextError) {
      throw nextError
    }

    if (nextDefault) {
      const { error } = await client
        .from("addresses")
        .update({ is_default: true, updated_at: new Date().toISOString() } as never)
        .eq("id", nextDefault.id)
      if (error) {
        throw error
      }
    }
  }
}

export const listWishlistItems = async (userId: string): Promise<WishlistItem[]> => {
  const { data, error } = await supabase()
    .from("wishlist_items")
    .select("*")
    .eq("user_id", userId)
    .order("added_at", { ascending: false })
    .returns<WishlistItemRow[]>()
  if (error) {
    throw error
  }

  const items = await Promise.all(
    (data ?? []).map(async (row) => {
      const product = await findProductById(row.product_id)
      if (!product) {
        return null
      }
      return mapWishlistItem(row, product)
    }),
  )

  return items.filter(Boolean) as WishlistItem[]
}

export const findWishlistItemByProduct = async (
  userId: string,
  productId: string,
): Promise<WishlistItem | null> => {
  const { data, error } = await supabase()
    .from("wishlist_items")
    .select("*")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle<WishlistItemRow>()
  if (error) {
    throw error
  }
  if (!data) {
    return null
  }
  const product = await findProductById(productId)
  if (!product) {
    return null
  }
  return mapWishlistItem(data, product)
}

export const addWishlistItem = async (userId: string, productId: string): Promise<WishlistItem | null> => {
  const existing = await findWishlistItemByProduct(userId, productId)
  if (existing) {
    return existing
  }

  const product = await findProductById(productId)
  if (!product) {
    return null
  }

  const row: Tables["wishlist_items"]["Insert"] = {
    id: `wish-${randomUUID()}`,
    user_id: userId,
    product_id: productId,
    added_at: new Date().toISOString(),
  }

  const { error } = await supabase().from("wishlist_items").insert(row as never)
  if (error) {
    throw error
  }

  return mapWishlistItem(row as WishlistItemRow, product)
}

export const removeWishlistItem = async (userId: string, itemId: string) => {
  const { error } = await supabase().from("wishlist_items").delete().eq("id", itemId).eq("user_id", userId)
  if (error) {
    throw error
  }
}

export const createSupportTicket = async (
  ticket: Omit<SupportTicket, "id" | "status" | "createdAt" | "updatedAt">,
) => {
  const timestamp = new Date().toISOString()
  const payload: Tables["support_tickets"]["Insert"] = {
    id: `ticket-${randomUUID()}`,
    name: ticket.name,
    email: ticket.email,
    topic: ticket.topic,
    order_number: ticket.orderNumber ?? null,
    message: ticket.message,
    status: "open",
    created_at: timestamp,
    updated_at: timestamp,
  }

  const { error } = await supabase().from("support_tickets").insert(payload as never)
  if (error) {
    throw error
  }
}

export const createReturnRequest = async (
  request: Omit<ReturnRequest, "id" | "status" | "createdAt">,
) => {
  const payload: Tables["return_requests"]["Insert"] = {
    id: `return-${randomUUID()}`,
    order_number: request.orderNumber,
    email: request.email,
    reason: request.reason,
    items: request.items,
    status: "pending",
    notes: request.notes ?? null,
    created_at: new Date().toISOString(),
  }

  const { error } = await supabase().from("return_requests").insert(payload as never)
  if (error) {
    throw error
  }
}

export const getNotificationPreferences = async (userId: string): Promise<NotificationPreferences> => {
  const { data, error } = await supabase()
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<NotificationPreferenceRow>()
  if (error) {
    throw error
  }
  if (!data) {
    return {
      marketingEmails: true,
      productAlerts: true,
      smsUpdates: false,
    }
  }
  return mapNotificationPreferences(data)
}

export const upsertNotificationPreferences = async (
  userId: string,
  preferences: NotificationPreferences,
) => {
  const payload: Tables["notification_preferences"]["Insert"] = {
    user_id: userId,
    marketing_emails: preferences.marketingEmails,
    product_alerts: preferences.productAlerts,
    sms_updates: preferences.smsUpdates,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase()
    .from("notification_preferences")
    .upsert(payload as never, { onConflict: "user_id" })
  if (error) {
    throw error
  }
}

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex")

export const createPasswordResetToken = async (userId: string, expiresInMs = 1000 * 60 * 60): Promise<string> => {
  const token = randomBytes(24).toString("hex")
  const now = new Date()
  const expiresAt = new Date(now.getTime() + expiresInMs)

  const client = supabase()

  const { error: deleteError } = await client.from("password_reset_tokens").delete().eq("user_id", userId)
  if (deleteError) {
    throw deleteError
  }

  const payload: Tables["password_reset_tokens"]["Insert"] = {
    id: `pwreset-${randomUUID()}`,
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: expiresAt.toISOString(),
    created_at: now.toISOString(),
  }

  const { error } = await client.from("password_reset_tokens").insert(payload as never)
  if (error) {
    throw error
  }

  return token
}

export const findPasswordResetToken = async (
  token: string,
): Promise<{ id: string; userId: string } | null> => {
  const hashed = hashToken(token)
  const { data, error } = await supabase()
    .from("password_reset_tokens")
    .select("*")
    .eq("token_hash", hashed)
    .maybeSingle<{ id: string; user_id: string; expires_at: string }>()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  if (new Date(data.expires_at).getTime() < Date.now()) {
    await supabase().from("password_reset_tokens").delete().eq("id", data.id)
    return null
  }

  return { id: data.id, userId: data.user_id }
}

export const deletePasswordResetToken = async (tokenId: string) => {
  const { error } = await supabase().from("password_reset_tokens").delete().eq("id", tokenId)
  if (error) {
    throw error
  }
}

export const updateUserPasswordHash = async (userId: string, passwordHash: string) => {
  const { error } = await supabase()
    .from("users")
    .update({ password_hash: passwordHash } as never)
    .eq("id", userId)
  if (error) {
    throw error
  }
}

export const createSession = async (userId: string, token: string, expiresAt: Date) => {
  const payload: Tables["sessions"]["Insert"] = {
    id: `session-${randomUUID()}`,
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  }

  const { error } = await supabase().from("sessions").insert(payload as never)
  if (error) {
    throw error
  }
}

export const findSession = async (
  token: string,
): Promise<{ session: SessionRow; user: InternalUser } | null> => {
  const hashed = hashToken(token)
  const { data: row, error } = await supabase()
    .from("sessions")
    .select("*")
    .eq("token_hash", hashed)
    .maybeSingle<SessionRow>()
  if (error) {
    throw error
  }
  if (!row) {
    return null
  }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    await supabase().from("sessions").delete().eq("id", row.id)
    return null
  }

  const { data: userRow, error: userError } = await supabase()
    .from("users")
    .select("*")
    .eq("id", row.user_id)
    .maybeSingle<UserRow>()
  if (userError) {
    throw userError
  }
  if (!userRow) {
    return null
  }

  return {
    session: row,
    user: mapUserWithPassword(userRow),
  }
}

export const deleteSessionByToken = async (token: string) => {
  const { error } = await supabase().from("sessions").delete().eq("token_hash", hashToken(token))
  if (error) {
    throw error
  }
}

export const findUserByEmail = async (email: string): Promise<InternalUser | null> => {
  const { data, error } = await supabase()
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle<UserRow>()
  if (error) {
    throw error
  }
  return data ? mapUserWithPassword(data) : null
}

export const findUserById = async (id: string): Promise<InternalUser | null> => {
  const { data, error } = await supabase()
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle<UserRow>()
  if (error) {
    throw error
  }
  return data ? mapUserWithPassword(data) : null
}

export const findUserByGoogleId = async (googleId: string): Promise<InternalUser | null> => {
  const hasGoogleColumn = await ensureGoogleIdColumnAvailable()
  if (!hasGoogleColumn) {
    return null
  }

  const { data, error } = await supabase()
    .from("users")
    .select("*")
    .eq(GOOGLE_ID_COLUMN, googleId)
    .maybeSingle<UserRow>()
  if (error) {
    if (isMissingGoogleIdColumnError(error)) {
      // Column was removed after the initial availability check; mark as unavailable and fall back.
      googleIdColumnAvailable = false
      warnMissingGoogleIdColumn()
      return null
    }
    throw error
  }
  return data ? mapUserWithPassword(data) : null
}

export const insertUser = async (user: {
  id: string
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  role?: string
  avatar?: string
  googleId?: string
}) => {
  const payload: Tables["users"]["Insert"] = {
    id: user.id,
    email: user.email,
    password_hash: user.passwordHash,
    first_name: user.firstName,
    last_name: user.lastName,
    avatar: user.avatar ?? null,
    role: (user.role as User["role"]) ?? "customer",
    created_at: new Date().toISOString(),
  }

  const hasGoogleColumn = await ensureGoogleIdColumnAvailable()
  if (hasGoogleColumn) {
    payload.google_id = user.googleId ?? null
  }

  const { error } = await supabase().from("users").insert(payload as never)
  if (error) {
    if (isMissingGoogleIdColumnError(error)) {
      warnMissingGoogleIdColumn()
      googleIdColumnAvailable = false
      if ("google_id" in payload) {
        delete (payload as Record<string, unknown>).google_id
        const retry = await supabase().from("users").insert(payload as never)
        if (retry.error) {
          throw retry.error
        }
        return
      }
    }
    throw error
  }
}

export const updateUserProfile = async (userId: string, data: Partial<User>) => {
  const existing = await findUserById(userId)
  if (!existing) {
    return
  }

  const { error } = await supabase()
    .from("users")
    .update({
      first_name: data.firstName ?? existing.firstName,
      last_name: data.lastName ?? existing.lastName,
      avatar: data.avatar ?? existing.avatar ?? null,
    } as never)
    .eq("id", userId)
  if (error) {
    throw error
  }
}

export const linkGoogleAccount = async (userId: string, googleId: string, avatar?: string) => {
  const payload: Tables["users"]["Update"] = {}

  const hasGoogleColumn = await ensureGoogleIdColumnAvailable()
  if (hasGoogleColumn) {
    payload.google_id = googleId
  }

  if (typeof avatar !== "undefined") {
    payload.avatar = avatar
  }

  if (Object.keys(payload).length === 0) {
    return
  }

  const { error } = await supabase().from("users").update(payload as never).eq("id", userId)
  if (error) {
    if (isMissingGoogleIdColumnError(error)) {
      warnMissingGoogleIdColumn()
      googleIdColumnAvailable = false
      const fallbackPayload: Tables["users"]["Update"] = {}
      if (typeof avatar !== "undefined") {
        fallbackPayload.avatar = avatar
      }
      if (Object.keys(fallbackPayload).length === 0) {
        return
      }
      const retry = await supabase().from("users").update(fallbackPayload as never).eq("id", userId)
      if (retry.error) {
        throw retry.error
      }
      return
    }
    throw error
  }
}

export const listUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase().from("users").select("*").order("created_at", { ascending: false })
  if (error) {
    throw error
  }
  return (data ?? []).map((row) => mapPublicUserRow(row))
}

export const deleteUser = async (userId: string) => {
  const { data, error } = await supabase()
    .from("users")
    .delete()
    .eq("id", userId)
    .select("id")
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    throw new Error("USER_NOT_FOUND")
  }
}

export const getSiteSetting = async (key: string): Promise<SiteSetting | null> => {
  const { data, error } = await supabase()
    .from("site_settings")
    .select("*")
    .eq("key", key)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data ? mapSiteSetting(data) : null
}

export const upsertSiteSetting = async (key: string, value: string): Promise<void> => {
  const payload: SiteSettingInsert = {
    key,
    value,
    updated_at: new Date().toISOString(),
  }
  const { error } = await supabase()
    .from("site_settings")
    .upsert([payload], { onConflict: "key" })

  if (error) {
    throw error
  }
}

export const deleteSiteSetting = async (key: string): Promise<void> => {
  const { error } = await supabase().from("site_settings").delete().eq("key", key)
  if (error) {
    throw error
  }
}
