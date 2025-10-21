import { randomUUID } from "crypto"
import { db } from "@/lib/db/client"
import "./sqlite-init"
import type { HeroSlide } from "@/types"

type HeroSlideRow = {
  id: string
  title: string
  subtitle: string | null
  image: string
  button_text: string | null
  button_link: string | null
  order_index: number
  active: number
  created_at: string
  updated_at: string
}

const mapRowToHeroSlide = (row: HeroSlideRow): HeroSlide => ({
  id: row.id,
  title: row.title,
  subtitle: row.subtitle ?? undefined,
  image: row.image,
  buttonText: row.button_text ?? undefined,
  buttonLink: row.button_link ?? undefined,
  orderIndex: row.order_index,
  active: Boolean(row.active),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export async function getActiveHeroSlides(): Promise<HeroSlide[]> {
  const rows = db
    .prepare(
      `SELECT * FROM hero_slides 
       WHERE active = 1 
       ORDER BY order_index ASC`
    )
    .all() as HeroSlideRow[]

  return rows.map(mapRowToHeroSlide)
}

export async function getAllHeroSlides(): Promise<HeroSlide[]> {
  const rows = db
    .prepare(`SELECT * FROM hero_slides ORDER BY order_index ASC`)
    .all() as HeroSlideRow[]

  return rows.map(mapRowToHeroSlide)
}

export async function getHeroSlideById(id: string): Promise<HeroSlide | null> {
  const row = db
    .prepare(`SELECT * FROM hero_slides WHERE id = ?`)
    .get(id) as HeroSlideRow | undefined

  if (!row) return null

  return mapRowToHeroSlide(row)
}

export async function createHeroSlide(data: {
  title: string
  subtitle?: string
  image: string
  buttonText?: string
  buttonLink?: string
  orderIndex?: number
  active?: boolean
}): Promise<HeroSlide> {
  const id = randomUUID()
  const now = new Date().toISOString()

  db.prepare(
    `INSERT INTO hero_slides 
     (id, title, subtitle, image, button_text, button_link, order_index, active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    data.title,
    data.subtitle || null,
    data.image,
    data.buttonText || null,
    data.buttonLink || null,
    data.orderIndex ?? 0,
    data.active ? 1 : 0,
    now,
    now
  )

  return (await getHeroSlideById(id))!
}

export async function updateHeroSlide(
  id: string,
  data: Partial<{
    title: string
    subtitle: string | null
    image: string
    buttonText: string | null
    buttonLink: string | null
    orderIndex: number
    active: boolean
  }>
): Promise<HeroSlide | null> {
  const now = new Date().toISOString()
  const updates: string[] = []
  const values: (string | number | null)[] = []

  if (data.title !== undefined) {
    updates.push("title = ?")
    values.push(data.title)
  }
  if (data.subtitle !== undefined) {
    updates.push("subtitle = ?")
    values.push(data.subtitle)
  }
  if (data.image !== undefined) {
    updates.push("image = ?")
    values.push(data.image)
  }
  if (data.buttonText !== undefined) {
    updates.push("button_text = ?")
    values.push(data.buttonText)
  }
  if (data.buttonLink !== undefined) {
    updates.push("button_link = ?")
    values.push(data.buttonLink)
  }
  if (data.orderIndex !== undefined) {
    updates.push("order_index = ?")
    values.push(data.orderIndex)
  }
  if (data.active !== undefined) {
    updates.push("active = ?")
    values.push(data.active ? 1 : 0)
  }

  if (updates.length === 0) {
    return await getHeroSlideById(id)
  }

  updates.push("updated_at = ?")
  values.push(now)
  values.push(id)

  db.prepare(`UPDATE hero_slides SET ${updates.join(", ")} WHERE id = ?`).run(...values)

  return await getHeroSlideById(id)
}

export async function deleteHeroSlide(id: string): Promise<boolean> {
  const result = db.prepare(`DELETE FROM hero_slides WHERE id = ?`).run(id)
  return result.changes > 0
}

export async function reorderHeroSlides(slideIds: string[]): Promise<void> {
  const stmt = db.prepare(`UPDATE hero_slides SET order_index = ?, updated_at = ? WHERE id = ?`)
  const now = new Date().toISOString()

  for (let i = 0; i < slideIds.length; i++) {
    stmt.run(i, now, slideIds[i])
  }
}
