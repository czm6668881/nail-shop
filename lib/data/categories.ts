import type { ProductCategory } from "@/types"

const FALLBACK_TIMESTAMP = "1970-01-01T00:00:00.000Z"

export const fallbackProductCategories: ProductCategory[] = [
  { id: "fallback-classic", name: "Classic", slug: "classic", sortOrder: 1, createdAt: FALLBACK_TIMESTAMP, updatedAt: FALLBACK_TIMESTAMP },
  { id: "fallback-french", name: "French", slug: "french", sortOrder: 2, createdAt: FALLBACK_TIMESTAMP, updatedAt: FALLBACK_TIMESTAMP },
  { id: "fallback-glitter", name: "Glitter", slug: "glitter", sortOrder: 3, createdAt: FALLBACK_TIMESTAMP, updatedAt: FALLBACK_TIMESTAMP },
  { id: "fallback-ombre", name: "Ombre", slug: "ombre", sortOrder: 4, createdAt: FALLBACK_TIMESTAMP, updatedAt: FALLBACK_TIMESTAMP },
  { id: "fallback-chrome", name: "Chrome", slug: "chrome", sortOrder: 5, createdAt: FALLBACK_TIMESTAMP, updatedAt: FALLBACK_TIMESTAMP },
  { id: "fallback-matte", name: "Matte", slug: "matte", sortOrder: 6, createdAt: FALLBACK_TIMESTAMP, updatedAt: FALLBACK_TIMESTAMP },
  { id: "fallback-stiletto", name: "Stiletto", slug: "stiletto", sortOrder: 7, createdAt: FALLBACK_TIMESTAMP, updatedAt: FALLBACK_TIMESTAMP },
  { id: "fallback-almond", name: "Almond", slug: "almond", sortOrder: 8, createdAt: FALLBACK_TIMESTAMP, updatedAt: FALLBACK_TIMESTAMP },
  { id: "fallback-coffin", name: "Coffin", slug: "coffin", sortOrder: 9, createdAt: FALLBACK_TIMESTAMP, updatedAt: FALLBACK_TIMESTAMP },
  { id: "fallback-square", name: "Square", slug: "square", sortOrder: 10, createdAt: FALLBACK_TIMESTAMP, updatedAt: FALLBACK_TIMESTAMP },
]
