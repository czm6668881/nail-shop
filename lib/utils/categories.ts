import type { ProductCategory } from "@/types"

export const sortProductCategories = (categories: ProductCategory[]): ProductCategory[] =>
  [...categories].sort((a, b) => {
    const aOrder = typeof a.sortOrder === "number" ? a.sortOrder : Number.MAX_SAFE_INTEGER
    const bOrder = typeof b.sortOrder === "number" ? b.sortOrder : Number.MAX_SAFE_INTEGER

    if (aOrder !== bOrder) {
      return aOrder - bOrder
    }

    return a.name.localeCompare(b.name)
  })
