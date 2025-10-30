import { db } from "./client"

const run = (sql: string) => {
  db.prepare(sql).run()
}

const columnExists = (table: string, column: string) => {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>
  return rows.some((row) => row.name === column)
}

const addColumnIfMissing = (table: string, column: string, columnDefinition: string) => {
  if (columnExists(table, column)) {
    return false
  }
  db.prepare(`ALTER TABLE ${table} ADD COLUMN ${columnDefinition}`).run()
  return true
}

export const migrate = () => {
  run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      avatar TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TEXT NOT NULL
    )
  `)

  addColumnIfMissing("users", "google_id", "google_id TEXT")
  run(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id
    ON users(google_id)
    WHERE google_id IS NOT NULL
  `)

  run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  run(`
    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      slug TEXT UNIQUE NOT NULL,
      image TEXT,
      product_count INTEGER DEFAULT 0,
      featured INTEGER NOT NULL DEFAULT 0
    )
  `)

  run(`
    CREATE TABLE IF NOT EXISTS product_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  run(`CREATE INDEX IF NOT EXISTS idx_product_categories_sort ON product_categories(sort_order, name)`)

  run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      compare_at_price REAL,
      images TEXT,
      category TEXT NOT NULL,
      collection_slug TEXT,
      in_stock INTEGER NOT NULL DEFAULT 1,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      sizes TEXT,
      features TEXT,
      application TEXT,
      materials TEXT,
      slug TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      FOREIGN KEY (collection_slug) REFERENCES collections(slug) ON DELETE SET NULL
    )
  `)

  run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      user_id TEXT,
      user_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      title TEXT NOT NULL,
      comment TEXT NOT NULL,
      images TEXT,
      verified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `)

  run(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      cover_image TEXT,
      author_name TEXT NOT NULL,
      author_avatar TEXT,
      category TEXT NOT NULL,
      tags TEXT,
      published INTEGER NOT NULL DEFAULT 0,
      published_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      read_time INTEGER DEFAULT 0
    )
  `)

  run(`
    CREATE TABLE IF NOT EXISTS carts (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `)

  run(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      cart_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      size TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      added_at TEXT NOT NULL,
      FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `)

  run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      order_number TEXT UNIQUE NOT NULL,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      shipping REAL NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      billing_address TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      tracking_number TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `)

  run(`
    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      address_line1 TEXT NOT NULL,
      address_line2 TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      country TEXT NOT NULL,
      phone TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  run(`CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id)`)

  run(`
    CREATE TABLE IF NOT EXISTS inventory_events (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      delta INTEGER NOT NULL,
      previous_quantity INTEGER NOT NULL,
      new_quantity INTEGER NOT NULL,
      reason TEXT NOT NULL,
      reference_type TEXT,
      reference_id TEXT,
      context TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `)

  run(`CREATE INDEX IF NOT EXISTS idx_inventory_events_product_created_at ON inventory_events(product_id, created_at DESC)`)

  run(`
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      added_at TEXT NOT NULL,
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `)

  run(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      topic TEXT NOT NULL,
      order_number TEXT,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  run(`
    CREATE TABLE IF NOT EXISTS return_requests (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL,
      email TEXT NOT NULL,
      reason TEXT NOT NULL,
      items TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      created_at TEXT NOT NULL
    )
  `)

  run(`
    CREATE TABLE IF NOT EXISTS notification_preferences (
      user_id TEXT PRIMARY KEY,
      marketing_emails INTEGER NOT NULL DEFAULT 1,
      product_alerts INTEGER NOT NULL DEFAULT 1,
      sms_updates INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  run(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens(user_id)`)

  run(`
    CREATE TABLE IF NOT EXISTS hero_slides (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      image TEXT NOT NULL,
      button_text TEXT,
      button_link TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  run(`CREATE INDEX IF NOT EXISTS idx_hero_slides_order ON hero_slides(order_index, active)`)

  run(`CREATE INDEX IF NOT EXISTS idx_orders_user_created_at ON orders(user_id, created_at DESC)`)
  run(`CREATE INDEX IF NOT EXISTS idx_cart_items_cart_product ON cart_items(cart_id, product_id, size)`)
  run(`CREATE INDEX IF NOT EXISTS idx_reviews_product_created_at ON reviews(product_id, created_at DESC)`)
  run(`CREATE INDEX IF NOT EXISTS idx_wishlist_user_created_at ON wishlist_items(user_id, added_at DESC)`)
  run(`CREATE INDEX IF NOT EXISTS idx_products_collection_featured ON products(collection_slug, featured, created_at DESC)`)

  run(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
}
