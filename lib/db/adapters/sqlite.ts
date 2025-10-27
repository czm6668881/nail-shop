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
} from "@/types"
import { db } from "../client"
import { migrate } from "../schema"
import { seed, ensureDefaultAdmin } from "../seed"
import { randomUUID, randomBytes, createHash } from "crypto"
import { InventoryError } from "@/lib/db/errors"

let sqliteInitialized = false

const ensureSqliteInitialized = () => {
  if (sqliteInitialized) {
    return
  }
  migrate()
  seed()
  sqliteInitialized = true
}

ensureSqliteInitialized()

type ProductRow = {
  id: string
  name: string
  description: string
  price: number
  compare_at_price: number | null
  images: string
  category: string
  category_name?: string | null
  collection_slug: string | null
  in_stock: number
  stock_quantity: number
  sizes: string
  features: string
  application: string
  materials: string
  slug: string
  created_at: string
  updated_at: string
  featured: number
  rating: number
  review_count: number
}

const DEFAULT_ADMIN_EMAIL = "admin@luxenails.com"

type ProductCategoryRow = {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

const PRODUCT_SELECT_BASE = `
  SELECT p.*, pc.name AS category_name
  FROM products p
  LEFT JOIN product_categories pc ON pc.slug = p.category
`

type ReviewRow = {
  id: string
  product_id: string
  user_id: string | null
  user_name: string
  rating: number
  title: string
  comment: string
  images: string
  verified: number
  created_at: string
}

type BlogPostRow = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string | null
  author_name: string
  author_avatar: string | null
  category: string
  tags: string
  published: number
  published_at: string | null
  created_at: string
  updated_at: string
  read_time: number
}

type CartRow = {
  id: string
  user_id: string | null
  created_at: string
  updated_at: string
}

type CartItemRow = {
  id: string
  cart_id: string
  product_id: string
  size: string
  quantity: number
  added_at: string
}

type OrderRow = {
  id: string
  user_id: string | null
  order_number: string
  items: string
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: string
  shipping_address: string
  billing_address: string
  payment_method: string
  tracking_number: string | null
  created_at: string
  updated_at: string
}

type AddressRow = {
  id: string
  user_id: string
  first_name: string
  last_name: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
  is_default: number
  created_at: string
  updated_at: string
}

type WishlistItemRow = {
  id: string
  user_id: string
  product_id: string
  added_at: string
}

type NotificationPreferenceRow = {
  user_id: string
  marketing_emails: number
  product_alerts: number
  sms_updates: number
  updated_at: string
}

type PasswordResetTokenRow = {
  id: string
  user_id: string
  token_hash: string
  expires_at: string
  created_at: string
}

const mapProduct = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  description: row.description,
  price: row.price,
  compareAtPrice: row.compare_at_price ?? undefined,
  images: JSON.parse(row.images),
  category: row.category,
  categoryLabel: row.category_name ?? undefined,
  collection: row.collection_slug ?? undefined,
  inStock: Boolean(row.in_stock),
  stockQuantity: row.stock_quantity,
  sizes: JSON.parse(row.sizes),
  features: JSON.parse(row.features),
  application: row.application,
  materials: JSON.parse(row.materials),
  slug: row.slug,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  featured: Boolean(row.featured),
  rating: row.rating,
  reviewCount: row.review_count,
})

const mapCategory = (row: ProductCategoryRow): ProductCategory => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description ?? undefined,
  sortOrder: row.sort_order,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

const mapReview = (row: ReviewRow): Review => ({
  id: row.id,
  productId: row.product_id,
  userId: row.user_id ?? "",
  userName: row.user_name,
  rating: row.rating,
  title: row.title,
  comment: row.comment,
  images: JSON.parse(row.images),
  verified: Boolean(row.verified),
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
  tags: JSON.parse(row.tags),
  published: Boolean(row.published),
  publishedAt: row.published_at ?? "",
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  readTime: row.read_time,
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

const mapCartItem = (row: CartItemRow, product: Product): CartItem => ({
  id: row.id,
  productId: row.product_id,
  product,
  quantity: row.quantity,
  size: row.size as NailSize,
  addedAt: row.added_at,
})

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
  isDefault: Boolean(row.is_default),
})

const mapWishlistItem = (row: WishlistItemRow, product: Product): WishlistItem => ({
  id: row.id,
  userId: row.user_id,
  productId: row.product_id,
  product,
  addedAt: row.added_at,
})

const mapNotificationPreferences = (row: NotificationPreferenceRow): NotificationPreferences => ({
  marketingEmails: Boolean(row.marketing_emails),
  productAlerts: Boolean(row.product_alerts),
  smsUpdates: Boolean(row.sms_updates),
})

export const listProducts = (): Product[] => {
  const stmt = db.prepare(`${PRODUCT_SELECT_BASE} ORDER BY datetime(p.created_at) DESC`)
  const rows = stmt.all() as ProductRow[]
  return rows.map(mapProduct)
}

export const findProductBySlug = (slug: string): Product | null => {
  const stmt = db.prepare(`${PRODUCT_SELECT_BASE} WHERE p.slug = ? LIMIT 1`)
  const row = stmt.get(slug) as ProductRow | undefined
  return row ? mapProduct(row) : null
}

export const findProductById = (id: string): Product | null => {
  const stmt = db.prepare(`${PRODUCT_SELECT_BASE} WHERE p.id = ? LIMIT 1`)
  const row = stmt.get(id) as ProductRow | undefined
  return row ? mapProduct(row) : null
}

export const listFeaturedProducts = (): Product[] => {
  const stmt = db.prepare(
    `${PRODUCT_SELECT_BASE} WHERE p.featured = 1 ORDER BY datetime(p.created_at) DESC LIMIT 12`,
  )
  const rows = stmt.all() as ProductRow[]
  return rows.map(mapProduct)
}

export const listProductsByCategory = (category: string): Product[] => {
  const stmt = db.prepare(
    `${PRODUCT_SELECT_BASE} WHERE p.category = @category ORDER BY datetime(p.created_at) DESC`,
  )
  const rows = stmt.all({ category }) as ProductRow[]
  return rows.map(mapProduct)
}

export const searchProductsByQuery = (query: string): Product[] => {
  const like = `%${query.toLowerCase()}%`
  const stmt = db.prepare(
    `${PRODUCT_SELECT_BASE} WHERE lower(p.name) LIKE @like OR lower(p.description) LIKE @like OR lower(p.category) LIKE @like`,
  )
  const rows = stmt.all({ like }) as ProductRow[]
  return rows.map(mapProduct)
}

export const listProductCategories = (): ProductCategory[] => {
  const stmt = db.prepare(
    "SELECT * FROM product_categories ORDER BY sort_order ASC, name COLLATE NOCASE ASC",
  )
  const rows = stmt.all() as ProductCategoryRow[]
  return rows.map(mapCategory)
}

export const findProductCategoryById = (id: string): ProductCategory | null => {
  const row = db
    .prepare("SELECT * FROM product_categories WHERE id = ? LIMIT 1")
    .get(id) as ProductCategoryRow | undefined
  return row ? mapCategory(row) : null
}

export const findProductCategoryBySlug = (slug: string): ProductCategory | null => {
  const row = db
    .prepare("SELECT * FROM product_categories WHERE slug = ? LIMIT 1")
    .get(slug) as ProductCategoryRow | undefined
  return row ? mapCategory(row) : null
}

export const createProductCategory = (category: {
  id: string
  name: string
  slug: string
  description?: string | null
  sortOrder?: number
}): ProductCategory => {
  const now = new Date().toISOString()
  const maxOrderRow = db.prepare("SELECT COALESCE(MAX(sort_order), -1) as max FROM product_categories").get() as {
    max: number
  }
  const nextSortOrder =
    typeof category.sortOrder === "number" ? category.sortOrder : (maxOrderRow.max ?? -1) + 1
  const payload = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? null,
    sort_order: nextSortOrder,
    created_at: now,
    updated_at: now,
  }

  db.prepare(
    `INSERT INTO product_categories (id, name, slug, description, sort_order, created_at, updated_at)
     VALUES (@id, @name, @slug, @description, @sort_order, @created_at, @updated_at)`,
  ).run(payload)

  return mapCategory(payload)
}

export const updateProductCategory = (
  id: string,
  updates: {
    name?: string
    slug?: string
    description?: string | null
    sortOrder?: number | null
  },
): ProductCategory | null => {
  const existingRow = db
    .prepare("SELECT * FROM product_categories WHERE id = ? LIMIT 1")
    .get(id) as ProductCategoryRow | undefined

  if (!existingRow) {
    return null
  }

  const nextSlug = updates.slug ?? existingRow.slug
  const slugChanged = nextSlug !== existingRow.slug
  const payload = {
    id,
    name: updates.name ?? existingRow.name,
    slug: nextSlug,
    description: updates.description ?? existingRow.description,
    sort_order: typeof updates.sortOrder === "number" ? updates.sortOrder : existingRow.sort_order,
    updated_at: new Date().toISOString(),
  }

  db.prepare(
    `UPDATE product_categories
     SET name = @name,
         slug = @slug,
         description = @description,
         sort_order = @sort_order,
         updated_at = @updated_at
     WHERE id = @id`,
  ).run(payload)

  if (slugChanged) {
    db.prepare("UPDATE products SET category = @nextSlug WHERE category = @previousSlug").run({
      nextSlug,
      previousSlug: existingRow.slug,
    })
  }

  return mapCategory({
    ...existingRow,
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    sort_order: payload.sort_order,
    updated_at: payload.updated_at,
  })
}

export const deleteProductCategory = (
  id: string,
): { success: true } | { success: false; reason: "CATEGORY_IN_USE" } => {
  const existingRow = db
    .prepare("SELECT * FROM product_categories WHERE id = ? LIMIT 1")
    .get(id) as ProductCategoryRow | undefined

  if (!existingRow) {
    return { success: true }
  }

  const productCountRow = db
    .prepare("SELECT COUNT(*) as count FROM products WHERE category = ?")
    .get(existingRow.slug) as { count: number }

  if (productCountRow.count > 0) {
    return { success: false, reason: "CATEGORY_IN_USE" }
  }

  db.prepare("DELETE FROM product_categories WHERE id = ?").run(id)
  return { success: true }
}

export const upsertProduct = (product: Product) => {
  const stmt = db.prepare(`
    INSERT INTO products (
      id,
      name,
      description,
      price,
      compare_at_price,
      images,
      category,
      collection_slug,
      in_stock,
      stock_quantity,
      sizes,
      features,
      application,
      materials,
      slug,
      created_at,
      updated_at,
      featured,
      rating,
      review_count
    ) VALUES (
      @id,
      @name,
      @description,
      @price,
      @compare_at_price,
      @images,
      @category,
      @collection_slug,
      @in_stock,
      @stock_quantity,
      @sizes,
      @features,
      @application,
      @materials,
      @slug,
      @created_at,
      @updated_at,
      @featured,
      @rating,
      @review_count
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      price = excluded.price,
      compare_at_price = excluded.compare_at_price,
      images = excluded.images,
      category = excluded.category,
      collection_slug = excluded.collection_slug,
      in_stock = excluded.in_stock,
      stock_quantity = excluded.stock_quantity,
      sizes = excluded.sizes,
      features = excluded.features,
      application = excluded.application,
      materials = excluded.materials,
      slug = excluded.slug,
      updated_at = excluded.updated_at,
      featured = excluded.featured,
      rating = excluded.rating,
      review_count = excluded.review_count
  `)

  stmt.run({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    compare_at_price: product.compareAtPrice ?? null,
    images: JSON.stringify(product.images),
    category: product.category,
    collection_slug: product.collection ?? null,
    in_stock: product.inStock ? 1 : 0,
    stock_quantity: product.stockQuantity,
    sizes: JSON.stringify(product.sizes),
    features: JSON.stringify(product.features),
    application: product.application,
    materials: JSON.stringify(product.materials),
    slug: product.slug,
    created_at: product.createdAt,
    updated_at: product.updatedAt,
    featured: product.featured ? 1 : 0,
    rating: product.rating,
    review_count: product.reviewCount,
  })
}

export const deleteProduct = (id: string) => {
  db.prepare("DELETE FROM products WHERE id = ?").run(id)
}

export const toggleProductFeatured = (id: string, featured: boolean) => {
  db.prepare("UPDATE products SET featured = ?, updated_at = ? WHERE id = ?").run(
    featured ? 1 : 0,
    new Date().toISOString(),
    id,
  )
}

export const listReviews = (): Review[] => {
  const stmt = db.prepare("SELECT * FROM reviews ORDER BY created_at DESC")
  const rows = stmt.all() as ReviewRow[]
  return rows.map(mapReview)
}

export const listReviewsByProductId = (productId: string): Review[] => {
  const stmt = db.prepare("SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC")
  const rows = stmt.all(productId) as ReviewRow[]
  return rows.map(mapReview)
}

export const listFeaturedReviews = (limit: number): Review[] => {
  const stmt = db.prepare(`
    SELECT * FROM reviews
    WHERE verified = 1 AND json_array_length(images) > 0
    ORDER BY created_at DESC
    LIMIT ?
  `)
  const rows = stmt.all(limit) as ReviewRow[]
  return rows.map(mapReview)
}

export const listBlogPosts = (publishedOnly = true): BlogPost[] => {
  const stmt = publishedOnly
    ? db.prepare("SELECT * FROM blog_posts WHERE published = 1 ORDER BY published_at DESC")
    : db.prepare("SELECT * FROM blog_posts ORDER BY created_at DESC")
  const rows = stmt.all() as BlogPostRow[]
  return rows.map(mapBlogPost)
}

export const findBlogPostBySlug = (slug: string, publishedOnly = true): BlogPost | null => {
  const stmt = publishedOnly
    ? db.prepare("SELECT * FROM blog_posts WHERE slug = ? AND published = 1")
    : db.prepare("SELECT * FROM blog_posts WHERE slug = ?")
  const row = stmt.get(slug) as BlogPostRow | undefined
  return row ? mapBlogPost(row) : null
}

export const listRelatedBlogPosts = (postId: string, limit = 3): BlogPost[] => {
  const post = db.prepare("SELECT category FROM blog_posts WHERE id = ?").get(postId) as { category: string } | undefined

  if (!post) {
    return []
  }

  const stmt = db.prepare(
    "SELECT * FROM blog_posts WHERE category = ? AND id != ? AND published = 1 ORDER BY published_at DESC LIMIT ?",
  )
  const rows = stmt.all(post.category, postId, limit) as BlogPostRow[]
  return rows.map(mapBlogPost)
}

export const upsertBlogPost = (post: BlogPost) => {
  const stmt = db.prepare(`
    INSERT INTO blog_posts (
      id,
      title,
      slug,
      excerpt,
      content,
      cover_image,
      author_name,
      author_avatar,
      category,
      tags,
      published,
      published_at,
      created_at,
      updated_at,
      read_time
    ) VALUES (
      @id,
      @title,
      @slug,
      @excerpt,
      @content,
      @cover_image,
      @author_name,
      @author_avatar,
      @category,
      @tags,
      @published,
      @published_at,
      @created_at,
      @updated_at,
      @read_time
    )
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      slug = excluded.slug,
      excerpt = excluded.excerpt,
      content = excluded.content,
      cover_image = excluded.cover_image,
      author_name = excluded.author_name,
      author_avatar = excluded.author_avatar,
      category = excluded.category,
      tags = excluded.tags,
      published = excluded.published,
      published_at = excluded.published_at,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at,
      read_time = excluded.read_time
  `)

  stmt.run({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    cover_image: post.coverImage,
    author_name: post.author.name,
    author_avatar: post.author.avatar,
    category: post.category,
    tags: JSON.stringify(post.tags),
    published: post.published ? 1 : 0,
    published_at: post.publishedAt,
    created_at: post.createdAt,
    updated_at: post.updatedAt,
    read_time: post.readTime,
  })
}

export const deleteBlogPost = (id: string) => {
  db.prepare("DELETE FROM blog_posts WHERE id = ?").run(id)
}

export const toggleBlogPublish = (id: string, published: boolean) => {
  const now = new Date().toISOString()
  db.prepare(
    `UPDATE blog_posts
     SET published = @published,
         updated_at = @updated_at,
         published_at = CASE WHEN @published = 1 THEN COALESCE(published_at, @updated_at) ELSE NULL END
     WHERE id = @id`,
  ).run({
    published: published ? 1 : 0,
    updated_at: now,
    id,
  })
}

export const listOrders = (): Order[] => {
  const stmt = db.prepare("SELECT * FROM orders ORDER BY created_at DESC")
  const rows = stmt.all() as OrderRow[]
  return rows.map(mapOrder)
}

export const listOrdersByUser = (userId: string): Order[] => {
  const stmt = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC")
  const rows = stmt.all(userId) as OrderRow[]
  return rows.map(mapOrder)
}

export const insertOrder = (order: Order) => {
  const insertOrderStmt = db.prepare(`
    INSERT INTO orders (
      id,
      user_id,
      order_number,
      items,
      subtotal,
      tax,
      shipping,
      total,
      status,
      shipping_address,
      billing_address,
      payment_method,
      tracking_number,
      created_at,
      updated_at
    ) VALUES (
      @id,
      @user_id,
      @order_number,
      @items,
      @subtotal,
      @tax,
      @shipping,
      @total,
      @status,
      @shipping_address,
      @billing_address,
      @payment_method,
      @tracking_number,
      @created_at,
      @updated_at
    )
  `)

  const selectProductQuantityStmt = db.prepare("SELECT stock_quantity FROM products WHERE id = ?")

  const updateProductStmt = db.prepare(`
    UPDATE products
    SET stock_quantity = @stock_quantity,
        in_stock = CASE WHEN @stock_quantity > 0 THEN 1 ELSE 0 END,
        updated_at = @updated_at
    WHERE id = @id
  `)

  const insertInventoryEventStmt = db.prepare(`
    INSERT INTO inventory_events (
      id,
      product_id,
      delta,
      previous_quantity,
      new_quantity,
      reason,
      reference_type,
      reference_id,
      context,
      created_at
    ) VALUES (
      @id,
      @product_id,
      @delta,
      @previous_quantity,
      @new_quantity,
      @reason,
      @reference_type,
      @reference_id,
      @context,
      @created_at
    )
  `)

  const aggregated = new Map<string, number>()
  for (const item of order.items ?? []) {
    if (!item.productId || item.quantity <= 0) {
      continue
    }
    const current = aggregated.get(item.productId) ?? 0
    aggregated.set(item.productId, current + item.quantity)
  }

  const eventTimestamp = new Date().toISOString()

  const transaction = db.transaction(() => {
    for (const [productId, quantity] of aggregated.entries()) {
      const currentRow = selectProductQuantityStmt.get(productId) as { stock_quantity: number } | undefined

      if (!currentRow) {
        throw new InventoryError("PRODUCT_NOT_FOUND", "The requested product does not exist or is no longer available.", { productId })
      }

      if (currentRow.stock_quantity < quantity) {
        throw new InventoryError("INSUFFICIENT_STOCK", "Insufficient stock. Adjust the quantity and try again.", {
          productId,
          available: currentRow.stock_quantity,
          requested: quantity,
        })
      }

      const newQuantity = currentRow.stock_quantity - quantity

      updateProductStmt.run({
        stock_quantity: newQuantity,
        updated_at: eventTimestamp,
        id: productId,
      })

      insertInventoryEventStmt.run({
        id: `inv-${randomUUID()}`,
        product_id: productId,
        delta: -quantity,
        previous_quantity: currentRow.stock_quantity,
        new_quantity: newQuantity,
        reason: "order_created",
        reference_type: "order",
        reference_id: order.id,
        context: JSON.stringify({
          orderNumber: order.orderNumber,
          status: order.status,
        }),
        created_at: eventTimestamp,
      })
    }

    insertOrderStmt.run({
      id: order.id,
      user_id: order.userId,
      order_number: order.orderNumber,
      items: JSON.stringify(order.items),
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      status: order.status,
      shipping_address: JSON.stringify(order.shippingAddress),
      billing_address: JSON.stringify(order.billingAddress),
      payment_method: order.paymentMethod,
      tracking_number: order.trackingNumber ?? null,
      created_at: order.createdAt,
      updated_at: order.updatedAt,
    })
  })

  try {
    transaction()
  } catch (error) {
    if (error instanceof InventoryError) {
      throw error
    }
    throw error
  }
}

export const updateOrderTrackingNumber = (orderId: string, trackingNumber: string | null): Order => {
  const now = new Date().toISOString()
  const updateStmt = db.prepare(`
    UPDATE orders
    SET tracking_number = @tracking_number,
        updated_at = @updated_at
    WHERE id = @id
  `)

  const result = updateStmt.run({
    tracking_number: trackingNumber ?? null,
    updated_at: now,
    id: orderId,
  })

  if (result.changes === 0) {
    throw new Error("ORDER_NOT_FOUND")
  }

  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as OrderRow | undefined
  if (!row) {
    throw new Error("ORDER_NOT_FOUND")
  }

  return mapOrder(row)
}

const mapOrder = (row: OrderRow): Order => ({
  id: row.id,
  userId: row.user_id ?? "",
  orderNumber: row.order_number,
  items: JSON.parse(row.items),
  subtotal: row.subtotal,
  tax: row.tax,
  shipping: row.shipping,
  total: row.total,
  status: row.status as Order["status"],
  shippingAddress: JSON.parse(row.shipping_address),
  billingAddress: JSON.parse(row.billing_address),
  paymentMethod: row.payment_method,
  trackingNumber: row.tracking_number ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export const ensureCart = (cartId?: string, userId?: string): { cart: CartRow; newlyCreated: boolean } => {
  if (cartId) {
    const existing = db.prepare("SELECT * FROM carts WHERE id = ?").get(cartId) as CartRow | undefined
    if (existing) {
      return { cart: existing, newlyCreated: false }
    }
  }

  const newCart: CartRow = {
    id: `cart-${randomUUID()}`,
    user_id: userId ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  db.prepare("INSERT INTO carts (id, user_id, created_at, updated_at) VALUES (@id, @user_id, @created_at, @updated_at)").run(
    newCart,
  )
  return { cart: newCart, newlyCreated: true }
}

export const fetchCart = (cartId: string): Cart | null => {
  const cartRow = db.prepare("SELECT * FROM carts WHERE id = ?").get(cartId) as CartRow | undefined
  if (!cartRow) {
    return null
  }

  const itemRows = db
    .prepare("SELECT * FROM cart_items WHERE cart_id = ? ORDER BY added_at DESC")
    .all(cartId) as CartItemRow[]

  const items = itemRows
    .map((itemRow) => {
      const product = findProductById(itemRow.product_id)
      if (!product) {
        return null
      }
      return mapCartItem(itemRow, product)
    })
    .filter(Boolean) as CartItem[]

  return mapCart(cartRow, items)
}

export const upsertCartItem = (args: { cartId: string; productId: string; size: string; quantity: number }) => {
  const existing = db
    .prepare(
      "SELECT * FROM cart_items WHERE cart_id = @cartId AND product_id = @productId AND size = @size",
    )
    .get(args) as CartItemRow | undefined

  if (existing) {
    const newQuantity = existing.quantity + args.quantity
    db.prepare("UPDATE cart_items SET quantity = ?, added_at = ? WHERE id = ?").run(
      newQuantity,
      new Date().toISOString(),
      existing.id,
    )
    return existing.id
  }

  const id = `item-${randomUUID()}`
  db.prepare(
    "INSERT INTO cart_items (id, cart_id, product_id, size, quantity, added_at) VALUES (@id, @cart_id, @product_id, @size, @quantity, @added_at)",
  ).run({
    id,
    cart_id: args.cartId,
    product_id: args.productId,
    size: args.size,
    quantity: args.quantity,
    added_at: new Date().toISOString(),
  })
  return id
}

export const updateCartItemQuantity = (itemId: string, quantity: number) => {
  db.prepare("UPDATE cart_items SET quantity = ?, added_at = ? WHERE id = ?").run(
    quantity,
    new Date().toISOString(),
    itemId,
  )
}

export const removeCartItem = (itemId: string) => {
  db.prepare("DELETE FROM cart_items WHERE id = ?").run(itemId)
}

export const clearCartItems = (cartId: string) => {
  db.prepare("DELETE FROM cart_items WHERE cart_id = ?").run(cartId)
}

export const touchCart = (cartId: string) => {
  db.prepare("UPDATE carts SET updated_at = ? WHERE id = ?").run(new Date().toISOString(), cartId)
}

export const listAddressesByUser = (userId: string): Address[] => {
  const rows = db
    .prepare("SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, datetime(updated_at) DESC")
    .all(userId) as AddressRow[]
  return rows.map(mapAddress)
}

export const createAddressForUser = (
  userId: string,
  data: Omit<Address, "id" | "userId">,
): Address => {
  const timestamp = new Date().toISOString()
  const id = `addr-${randomUUID()}`
  const defaultCountRow = db
    .prepare("SELECT COUNT(*) as count FROM addresses WHERE user_id = ? AND is_default = 1")
    .get(userId) as { count: number }
  let shouldBeDefault = data.isDefault ?? false
  if (!shouldBeDefault && defaultCountRow.count === 0) {
    shouldBeDefault = true
  }

  const insert = db.prepare(`
    INSERT INTO addresses (
      id,
      user_id,
      first_name,
      last_name,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      phone,
      is_default,
      created_at,
      updated_at
    ) VALUES (
      @id,
      @user_id,
      @first_name,
      @last_name,
      @address_line1,
      @address_line2,
      @city,
      @state,
      @postal_code,
      @country,
      @phone,
      @is_default,
      @created_at,
      @updated_at
    )
  `)

  const transaction = db.transaction(() => {
    if (shouldBeDefault) {
      db.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?").run(userId)
    }

    insert.run({
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
      is_default: shouldBeDefault ? 1 : 0,
      created_at: timestamp,
      updated_at: timestamp,
    })
  })

  transaction()

  const row = db.prepare("SELECT * FROM addresses WHERE id = ?").get(id) as AddressRow
  return mapAddress(row)
}

export const setDefaultAddressForUser = (userId: string, addressId: string) => {
  const transaction = db.transaction(() => {
    const address = db
      .prepare("SELECT id FROM addresses WHERE id = ? AND user_id = ?")
      .get(addressId, userId) as { id: string } | undefined
    if (!address) {
      throw new Error("Address not found.")
    }

    db.prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?").run(userId)
    db.prepare("UPDATE addresses SET is_default = 1, updated_at = ? WHERE id = ?").run(new Date().toISOString(), addressId)
  })

  transaction()
}

export const deleteAddressForUser = (userId: string, addressId: string) => {
  const transaction = db.transaction(() => {
    const address = db
      .prepare("SELECT is_default FROM addresses WHERE id = ? AND user_id = ?")
      .get(addressId, userId) as { is_default: number } | undefined

    if (!address) {
      throw new Error("Address not found.")
    }

    db.prepare("DELETE FROM addresses WHERE id = ? AND user_id = ?").run(addressId, userId)

    if (address.is_default === 1) {
      const nextDefault = db
        .prepare("SELECT id FROM addresses WHERE user_id = ? ORDER BY datetime(updated_at) DESC LIMIT 1")
        .get(userId) as { id: string } | undefined
      if (nextDefault) {
        db.prepare("UPDATE addresses SET is_default = 1, updated_at = ? WHERE id = ?").run(
          new Date().toISOString(),
          nextDefault.id,
        )
      }
    }
  })

  transaction()
}

export const listWishlistItems = (userId: string): WishlistItem[] => {
  const rows = db
    .prepare("SELECT * FROM wishlist_items WHERE user_id = ? ORDER BY datetime(added_at) DESC")
    .all(userId) as WishlistItemRow[]

  return rows
    .map((row) => {
      const product = findProductById(row.product_id)
      if (!product) {
        return null
      }
      return mapWishlistItem(row, product)
    })
    .filter(Boolean) as WishlistItem[]
}

export const findWishlistItemByProduct = (userId: string, productId: string): WishlistItem | null => {
  const row = db
    .prepare("SELECT * FROM wishlist_items WHERE user_id = ? AND product_id = ?")
    .get(userId, productId) as WishlistItemRow | undefined
  if (!row) {
    return null
  }
  const product = findProductById(productId)
  if (!product) {
    return null
  }
  return mapWishlistItem(row, product)
}

export const addWishlistItem = (userId: string, productId: string): WishlistItem | null => {
  const existing = db
    .prepare("SELECT * FROM wishlist_items WHERE user_id = ? AND product_id = ?")
    .get(userId, productId) as WishlistItemRow | undefined

  if (existing) {
    const product = findProductById(productId)
    return product ? mapWishlistItem(existing, product) : null
  }

  const product = findProductById(productId)
  if (!product) {
    return null
  }

  const row: WishlistItemRow = {
    id: `wish-${randomUUID()}`,
    user_id: userId,
    product_id: productId,
    added_at: new Date().toISOString(),
  }

  db.prepare(
    "INSERT INTO wishlist_items (id, user_id, product_id, added_at) VALUES (@id, @user_id, @product_id, @added_at)",
  ).run(row)

  return mapWishlistItem(row, product)
}

export const removeWishlistItem = (userId: string, itemId: string) => {
  db.prepare("DELETE FROM wishlist_items WHERE id = ? AND user_id = ?").run(itemId, userId)
}

export const createSupportTicket = (ticket: Omit<SupportTicket, "id" | "status" | "createdAt" | "updatedAt">) => {
  const now = new Date().toISOString()
  db.prepare(
    `INSERT INTO support_tickets (id, name, email, topic, order_number, message, status, created_at, updated_at)
     VALUES (@id, @name, @email, @topic, @order_number, @message, @status, @created_at, @updated_at)`,
  ).run({
    id: `ticket-${randomUUID()}`,
    name: ticket.name,
    email: ticket.email,
    topic: ticket.topic,
    order_number: ticket.orderNumber ?? null,
    message: ticket.message,
    status: "open",
    created_at: now,
    updated_at: now,
  })
}

export const createReturnRequest = (
  request: Omit<ReturnRequest, "id" | "status" | "createdAt">,
) => {
  db.prepare(
    `INSERT INTO return_requests (
      id,
      order_number,
      email,
      reason,
      items,
      status,
      notes,
      created_at
    ) VALUES (
      @id,
      @order_number,
      @email,
      @reason,
      @items,
      @status,
      @notes,
      @created_at
    )`,
  ).run({
    id: `return-${randomUUID()}`,
    order_number: request.orderNumber,
    email: request.email,
    reason: request.reason,
    items: request.items,
    status: "pending",
    notes: request.notes ?? null,
    created_at: new Date().toISOString(),
  })
}

export const getNotificationPreferences = (userId: string): NotificationPreferences => {
  const row = db.prepare("SELECT * FROM notification_preferences WHERE user_id = ?").get(userId) as
    | NotificationPreferenceRow
    | undefined
  if (!row) {
    return {
      marketingEmails: true,
      productAlerts: true,
      smsUpdates: false,
    }
  }
  return mapNotificationPreferences(row)
}

export const upsertNotificationPreferences = (userId: string, preferences: NotificationPreferences) => {
  db.prepare(
    `INSERT INTO notification_preferences (user_id, marketing_emails, product_alerts, sms_updates, updated_at)
     VALUES (@user_id, @marketing_emails, @product_alerts, @sms_updates, @updated_at)
     ON CONFLICT(user_id) DO UPDATE SET
       marketing_emails = excluded.marketing_emails,
       product_alerts = excluded.product_alerts,
       sms_updates = excluded.sms_updates,
       updated_at = excluded.updated_at`,
  ).run({
    user_id: userId,
    marketing_emails: preferences.marketingEmails ? 1 : 0,
    product_alerts: preferences.productAlerts ? 1 : 0,
    sms_updates: preferences.smsUpdates ? 1 : 0,
    updated_at: new Date().toISOString(),
  })
}

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex")

export const createPasswordResetToken = (userId: string, expiresInMs = 1000 * 60 * 60): string => {
  const token = randomBytes(24).toString("hex")
  const now = new Date()
  const expiresAt = new Date(now.getTime() + expiresInMs)

  const transaction = db.transaction(() => {
    db.prepare("DELETE FROM password_reset_tokens WHERE user_id = ?").run(userId)
    db.prepare(
      `INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, created_at)
       VALUES (@id, @user_id, @token_hash, @expires_at, @created_at)`,
    ).run({
      id: `pwreset-${randomUUID()}`,
      user_id: userId,
      token_hash: hashToken(token),
      expires_at: expiresAt.toISOString(),
      created_at: now.toISOString(),
    })
  })

  transaction()

  return token
}

export const findPasswordResetToken = (
  token: string,
): { id: string; userId: string } | null => {
  const row = db
    .prepare("SELECT * FROM password_reset_tokens WHERE token_hash = ?")
    .get(hashToken(token)) as PasswordResetTokenRow | undefined

  if (!row) {
    return null
  }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare("DELETE FROM password_reset_tokens WHERE id = ?").run(row.id)
    return null
  }

  return {
    id: row.id,
    userId: row.user_id,
  }
}

export const deletePasswordResetToken = (tokenId: string) => {
  db.prepare("DELETE FROM password_reset_tokens WHERE id = ?").run(tokenId)
}

export const updateUserPasswordHash = (userId: string, passwordHash: string) => {
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(passwordHash, userId)
}

export const createSession = (userId: string, token: string, expiresAt: Date) => {
  db.prepare(
    "INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (@id, @user_id, @token_hash, @expires_at, @created_at)",
  ).run({
    id: `session-${randomUUID()}`,
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  })
}

export const findSession = (token: string) => {
  const row = db
    .prepare("SELECT * FROM sessions WHERE token_hash = ?")
    .get(hashToken(token)) as
    | {
        id: string
        user_id: string
        token_hash: string
        expires_at: string
      }
    | undefined

  if (!row) {
    return null
  }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(row.id)
    return null
  }

  const userRow = db.prepare("SELECT * FROM users WHERE id = ?").get(row.user_id) as UserRow | undefined
  if (!userRow) {
    return null
  }

  return {
    session: row,
    user: mapUser(userRow),
  }
}

export const deleteSessionByToken = (token: string) => {
  db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token))
}

export const findUserByEmail = (email: string): InternalUser | null => {
  let row = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined
  if (row) {
    return mapUser(row)
  }

  if (email === DEFAULT_ADMIN_EMAIL) {
    ensureDefaultAdmin()
    row = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined
    if (row) {
      return mapUser(row)
    }
  }

  return null
}

export const findUserById = (id: string): InternalUser | null => {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined
  return row ? mapUser(row) : null
}

export const findUserByGoogleId = (googleId: string): InternalUser | null => {
  const row = db.prepare("SELECT * FROM users WHERE google_id = ?").get(googleId) as UserRow | undefined
  return row ? mapUser(row) : null
}

export const insertUser = (user: {
  id: string
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  role?: string
  avatar?: string
  googleId?: string
}) => {
  db.prepare(
    `INSERT INTO users (
      id,
      email,
      password_hash,
      first_name,
      last_name,
      avatar,
      google_id,
      role,
      created_at
    ) VALUES (
      @id,
      @email,
      @password_hash,
      @first_name,
      @last_name,
      @avatar,
      @google_id,
      @role,
      @created_at
    )`,
  ).run({
    id: user.id,
    email: user.email,
    password_hash: user.passwordHash,
    first_name: user.firstName,
    last_name: user.lastName,
    avatar: user.avatar ?? null,
    google_id: user.googleId ?? null,
    role: user.role ?? "customer",
    created_at: new Date().toISOString(),
  })
}

type UserRow = {
  id: string
  email: string
  password_hash: string
  google_id: string | null
  first_name: string
  last_name: string
  avatar: string | null
  role: string
  created_at: string
}

type InternalUser = User & { passwordHash: string; googleId: string | null }

const mapUser = (row: UserRow): InternalUser => ({
  id: row.id,
  email: row.email,
  firstName: row.first_name,
  lastName: row.last_name,
  avatar: row.avatar ?? undefined,
  createdAt: row.created_at,
  role: row.role as User["role"],
  passwordHash: row.password_hash,
  googleId: row.google_id,
})

export const updateUserProfile = (userId: string, data: Partial<User>) => {
  const user = findUserById(userId)
  if (!user) return

  db.prepare(
    "UPDATE users SET first_name = @first_name, last_name = @last_name, avatar = @avatar WHERE id = @id",
  ).run({
    id: userId,
    first_name: data.firstName ?? user.firstName,
    last_name: data.lastName ?? user.lastName,
    avatar: data.avatar ?? user.avatar ?? null,
  })
}

export const linkGoogleAccount = (userId: string, googleId: string, avatar?: string) => {
  db.prepare(
    `UPDATE users
     SET google_id = @google_id,
         avatar = COALESCE(@avatar, avatar)
     WHERE id = @id`,
  ).run({
    id: userId,
    google_id: googleId,
    avatar: avatar ?? null,
  })
}

export const toPublicUser = (user: User & { passwordHash: string }): User => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  avatar: user.avatar,
  createdAt: user.createdAt,
  role: user.role,
})

export const listUsers = (): User[] => {
  const rows = db.prepare("SELECT * FROM users ORDER BY datetime(created_at) DESC").all() as UserRow[]
  return rows.map((row) => toPublicUser(mapUser(row)))
}
