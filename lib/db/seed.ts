import { randomUUID } from "crypto"
import bcrypt from "bcryptjs"
import { db } from "./client"
import { products as seedProducts, collections as seedCollections } from "@/lib/data/products"
import { mockBlogPosts, mockReviews, mockOrders, mockAddresses } from "@/lib/data/mock-data"

const getCount = (table: string) => {
  const row = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as { count: number }
  return row.count
}

const defaultAdmin = {
  email: "admin@luxenails.com",
  password: "Admin123!",
  firstName: "Admin",
  lastName: "User",
  avatar: "/placeholder.svg?height=100&width=100",
}

const insertUser = db.prepare(`
  INSERT INTO users (id, email, password_hash, first_name, last_name, avatar, role, created_at)
  VALUES (@id, @email, @password_hash, @first_name, @last_name, @avatar, @role, @created_at)
`)

const ensureDefaultAdminUser = () => {
  type AdminRow = {
    id: string
    email: string
    password_hash: string
    first_name: string
    last_name: string
    avatar: string | null
    role: string
    created_at: string
  }

  const adminByEmail = db
    .prepare("SELECT * FROM users WHERE email = ? LIMIT 1")
    .get(defaultAdmin.email) as AdminRow | undefined

  if (adminByEmail) {
    let needsUpdate = false
    let passwordHash = adminByEmail.password_hash

    if (!bcrypt.compareSync(defaultAdmin.password, adminByEmail.password_hash)) {
      passwordHash = bcrypt.hashSync(defaultAdmin.password, 10)
      needsUpdate = true
    }

    if (
      adminByEmail.role !== "admin" ||
      adminByEmail.first_name !== defaultAdmin.firstName ||
      adminByEmail.last_name !== defaultAdmin.lastName ||
      adminByEmail.avatar !== defaultAdmin.avatar
    ) {
      needsUpdate = true
    }

    if (needsUpdate) {
      db.prepare(
        `
        UPDATE users
        SET password_hash = @password_hash,
            role = @role,
            first_name = @first_name,
            last_name = @last_name,
            avatar = @avatar
        WHERE id = @id
      `,
      ).run({
        id: adminByEmail.id,
        password_hash: passwordHash,
        role: "admin",
        first_name: defaultAdmin.firstName,
        last_name: defaultAdmin.lastName,
        avatar: defaultAdmin.avatar,
      })
    }

    return adminByEmail.id
  }

  const adminPasswordHash = bcrypt.hashSync(defaultAdmin.password, 10)
  const adminId = `user-${randomUUID()}`
  const now = new Date().toISOString()

  insertUser.run({
    id: adminId,
    email: defaultAdmin.email,
    password_hash: adminPasswordHash,
    first_name: defaultAdmin.firstName,
    last_name: defaultAdmin.lastName,
    avatar: defaultAdmin.avatar,
    role: "admin",
    created_at: now,
  })

  return adminId
}

export const ensureDefaultAdmin = () => ensureDefaultAdminUser()

export const seed = () => {
  let defaultCustomerId: string | null = null

  if (getCount("users") === 0) {
    const adminId = `user-${randomUUID()}`
    const customerId = `user-${randomUUID()}`
    const adminPasswordHash = bcrypt.hashSync(defaultAdmin.password, 10)
    const customerPasswordHash = bcrypt.hashSync("Customer123!", 10)
    const now = new Date().toISOString()

    insertUser.run({
      id: adminId,
      email: defaultAdmin.email,
      password_hash: adminPasswordHash,
      first_name: defaultAdmin.firstName,
      last_name: defaultAdmin.lastName,
      avatar: defaultAdmin.avatar,
      role: "admin",
      created_at: now,
    })

    insertUser.run({
      id: customerId,
      email: "customer@luxenails.com",
      password_hash: customerPasswordHash,
      first_name: "Emma",
      last_name: "Wilson",
      avatar: "/placeholder.svg?height=100&width=100",
      role: "customer",
      created_at: now,
    })

    defaultCustomerId = customerId
  } else {
    const customer = db.prepare("SELECT id FROM users WHERE role = 'customer' ORDER BY created_at ASC LIMIT 1").get() as
      | { id: string }
      | undefined
    defaultCustomerId = customer?.id ?? null
  }

  ensureDefaultAdminUser()

  // Seed collections
  if (getCount("collections") === 0) {
    const insertCollection = db.prepare(`
      INSERT INTO collections (id, name, description, slug, image, product_count, featured)
      VALUES (@id, @name, @description, @slug, @image, @product_count, @featured)
    `)

    seedCollections.forEach((collection) => {
      insertCollection.run({
        id: collection.id,
        name: collection.name,
        description: collection.description,
        slug: collection.slug,
        image: collection.image,
        product_count: collection.productCount,
        featured: collection.featured ? 1 : 0,
      })
    })
  }

  const collectionSlugMap = new Map(seedCollections.map((collection) => [collection.name, collection.slug]))

  // Seed addresses for the default customer
  if (getCount("addresses") === 0 && defaultCustomerId) {
    const insertAddress = db.prepare(`
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

    mockAddresses.forEach((address, index) => {
      const timestamp = new Date().toISOString()
      insertAddress.run({
        id: address.id,
        user_id: defaultCustomerId,
        first_name: address.firstName,
        last_name: address.lastName,
        address_line1: address.addressLine1,
        address_line2: address.addressLine2 ?? null,
        city: address.city,
        state: address.state,
        postal_code: address.postalCode,
        country: address.country,
        phone: address.phone,
        is_default: index === 0 ? 1 : 0,
        created_at: timestamp,
        updated_at: timestamp,
      })
    })
  }

  // Seed products
  if (getCount("products") === 0) {
    const insertProduct = db.prepare(`
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
    `)

    seedProducts.forEach((product) => {
      const collectionSlug = product.collection ? collectionSlugMap.get(product.collection) ?? null : null
      insertProduct.run({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        compare_at_price: product.compareAtPrice ?? null,
        images: JSON.stringify(product.images),
        category: product.category,
        collection_slug: collectionSlug,
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
    })
  }

  // Seed reviews
  if (getCount("reviews") === 0) {
    const insertReview = db.prepare(`
      INSERT INTO reviews (
        id,
        product_id,
        user_id,
        user_name,
        rating,
        title,
        comment,
        images,
        verified,
        created_at
      ) VALUES (
        @id,
        @product_id,
        @user_id,
        @user_name,
        @rating,
        @title,
        @comment,
        @images,
        @verified,
        @created_at
      )
    `)

    mockReviews.forEach((review) => {
      insertReview.run({
        id: review.id,
        product_id: review.productId,
        user_id: review.userId,
        user_name: review.userName,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        images: JSON.stringify(review.images ?? []),
        verified: review.verified ? 1 : 0,
        created_at: review.createdAt,
      })
    })
  }

  // Seed blog posts
  if (getCount("blog_posts") === 0) {
    const insertBlogPost = db.prepare(`
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
    `)

    mockBlogPosts.forEach((post) => {
      insertBlogPost.run({
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
    })
  }
  // Seed orders
  if (getCount("orders") === 0) {
    const insertOrder = db.prepare(`
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

    const product = seedProducts[0]
    const quantity = 2
    const subtotal = product.price * quantity
    const tax = Number((subtotal * 0.09).toFixed(2))
    const shipping = 0 // Free worldwide shipping
    const total = Number((subtotal + tax + shipping).toFixed(2))
    const timestamp = new Date().toISOString()

    const baseAddress = mockOrders[0]?.shippingAddress ?? {
      firstName: "Emma",
      lastName: "Wilson",
      addressLine1: "123 Fashion Avenue",
      addressLine2: "Apt 4B",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "United States",
      phone: "+1 (555) 123-4567",
      isDefault: true,
    }

    const shippingAddress = {
      ...baseAddress,
      id: `addr-${randomUUID()}`,
      userId: defaultCustomerId ?? "guest",
    }

    const billingAddress = {
      ...shippingAddress,
      id: `addr-${randomUUID()}`,
    }

    insertOrder.run({
      id: `order-${randomUUID()}`,
      user_id: defaultCustomerId,
      order_number: `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      items: JSON.stringify([
        {
          id: `item-${randomUUID()}`,
          productId: product.id,
          product,
          quantity,
          size: product.sizes[0],
          addedAt: timestamp,
        },
      ]),
      subtotal,
      tax,
      shipping,
      total,
      status: "delivered",
      shipping_address: JSON.stringify(shippingAddress),
      billing_address: JSON.stringify(billingAddress),
      payment_method: "Credit Card ending in 4242",
      tracking_number: "1Z999AA10123456784",
      created_at: timestamp,
      updated_at: timestamp,
    })
  }
}
