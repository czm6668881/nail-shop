import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { HeroSlide } from "@/types"
import type { Database } from "@/types/database"

type HeroSlideRow = Database["public"]["Tables"]["hero_slides"]["Row"]
type HeroSlideInsert = Database["public"]["Tables"]["hero_slides"]["Insert"]
type HeroSlideUpdate = Database["public"]["Tables"]["hero_slides"]["Update"]

const missingTableMessage = "Supabase 中未找到 hero_slides 表，请在 SQL Editor 中运行 supabase/migrations/0004_hero_slides.sql 后重试。"

const isMissingTableError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false
  }
  const maybeMessage = (error as { message?: unknown }).message
  return typeof maybeMessage === "string" && maybeMessage.includes("public.hero_slides")
}

const mapRowToHeroSlide = (row: HeroSlideRow): HeroSlide => ({
  id: row.id,
  title: row.title,
  subtitle: row.subtitle ?? undefined,
  image: row.image,
  buttonText: row.button_text ?? undefined,
  buttonLink: row.button_link ?? undefined,
  orderIndex: row.order_index,
  active: row.active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export async function getActiveHeroSlides(): Promise<HeroSlide[]> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("hero_slides")
    .select("*")
    .eq("active", true)
    .order("order_index", { ascending: true })

  if (error) {
    if (isMissingTableError(error)) {
      console.warn("[hero-slides] hero_slides table missing in Supabase, returning empty list.")
      return []
    }
    throw new Error(`Failed to fetch active hero slides: ${error.message}`)
  }

  return (data ?? []).map(mapRowToHeroSlide)
}

export async function getAllHeroSlides(): Promise<HeroSlide[]> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("hero_slides")
    .select("*")
    .order("order_index", { ascending: true })

  if (error) {
    if (isMissingTableError(error)) {
      console.warn("[hero-slides] hero_slides table missing in Supabase, returning empty list.")
      return []
    }
    throw new Error(`Failed to fetch hero slides: ${error.message}`)
  }

  return (data ?? []).map(mapRowToHeroSlide)
}

export async function getHeroSlideById(id: string): Promise<HeroSlide | null> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("hero_slides")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    if (isMissingTableError(error)) {
      console.warn("[hero-slides] hero_slides table missing in Supabase, returning null.")
      return null
    }
    throw new Error(`Failed to fetch hero slide: ${error.message}`)
  }

  if (!data) {
    return null
  }

  return mapRowToHeroSlide(data)
}

const ensureTableExistsOrThrow = (error: unknown): never => {
  if (isMissingTableError(error)) {
    throw new Error(missingTableMessage)
  }
  const message = error && typeof error === "object" && "message" in error && typeof (error as { message: unknown }).message === "string"
    ? (error as { message: string }).message
    : "Unknown error"
  throw new Error(message)
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
  const supabase = getSupabaseAdminClient()
  const now = new Date().toISOString()
  const payload: HeroSlideInsert = {
    title: data.title,
    subtitle: data.subtitle ?? null,
    image: data.image,
    button_text: data.buttonText ?? null,
    button_link: data.buttonLink ?? null,
    order_index: data.orderIndex ?? 0,
    active: data.active ?? true,
    created_at: now,
    updated_at: now,
  }
  const { data: rows, error } = await supabase
    .from("hero_slides")
    .insert(payload as never)
    .select()
    .maybeSingle()

  if (error) {
    ensureTableExistsOrThrow(error)
  }

  if (!rows) {
    throw new Error("Failed to create hero slide: no data returned")
  }

  return mapRowToHeroSlide(rows)
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
  const supabase = getSupabaseAdminClient()
  const updates: HeroSlideUpdate = {
    updated_at: new Date().toISOString(),
  }

  if (data.title !== undefined) updates.title = data.title
  if (data.subtitle !== undefined) updates.subtitle = data.subtitle
  if (data.image !== undefined) updates.image = data.image
  if (data.buttonText !== undefined) updates.button_text = data.buttonText
  if (data.buttonLink !== undefined) updates.button_link = data.buttonLink
  if (data.orderIndex !== undefined) updates.order_index = data.orderIndex
  if (data.active !== undefined) updates.active = data.active

  if (Object.keys(updates).length === 1) {
    return await getHeroSlideById(id)
  }

  const { data: row, error } = await supabase
    .from("hero_slides")
    .update(updates as never)
    .eq("id", id)
    .select()
    .maybeSingle()

  if (error) {
    ensureTableExistsOrThrow(error)
  }

  if (!row) {
    return null
  }

  return mapRowToHeroSlide(row)
}

export async function deleteHeroSlide(id: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient()
  const { error, count } = await supabase
    .from("hero_slides")
    .delete({ count: "exact" })
    .eq("id", id)

  if (error) {
    ensureTableExistsOrThrow(error)
  }

  return (count ?? 0) > 0
}

export async function reorderHeroSlides(slideIds: string[]): Promise<void> {
  const supabase = getSupabaseAdminClient()
  const now = new Date().toISOString()

  for (let index = 0; index < slideIds.length; index++) {
    const slideId = slideIds[index]
    const { error } = await supabase
      .from("hero_slides")
      .update({ order_index: index, updated_at: now } as never)
      .eq("id", slideId)

    if (error) {
      ensureTableExistsOrThrow(error)
    }
  }
}
