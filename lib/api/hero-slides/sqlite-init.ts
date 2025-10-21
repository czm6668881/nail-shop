import { db } from "@/lib/db/client"

const ensureHeroSlidesTable = () => {
  db.prepare(`
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
  `).run()

  db.prepare(`CREATE INDEX IF NOT EXISTS idx_hero_slides_order ON hero_slides(order_index, active)`).run()
}

ensureHeroSlidesTable()

