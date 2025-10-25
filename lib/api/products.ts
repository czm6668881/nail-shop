import {
  findProductBySlug,
  listFeaturedProducts,
  listProducts,
  listProductsByCategory,
  searchProductsByQuery,
  listProductCategories,
  listOrders,
} from "@/lib/db/queries"
import type { Product, ProductCategory } from "@/types"
import { sortProductCategories } from "@/lib/utils/categories"

export async function getProducts(): Promise<Product[]> {
  return listProducts()
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return listFeaturedProducts()
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return findProductBySlug(slug)
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return listProductsByCategory(category)
}

export async function searchProducts(query: string): Promise<Product[]> {
  if (!query) {
    return listProducts()
  }
  return searchProductsByQuery(query)
}

export async function getProductCategories(): Promise<ProductCategory[]> {
  const categories = await listProductCategories()
  return sortProductCategories(categories)
}

type BestSellerOptions = {
  seedProducts?: Product[]
}

export async function getBestSellingProducts(limit = 4, options: BestSellerOptions = {}): Promise<Product[]> {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 4
  const baseProducts = options.seedProducts ?? (await listProducts())
  const orders = await listOrders()

  const productMap = new Map(baseProducts.map((product) => [product.id, product]))
  const sales = new Map<string, { units: number; lastSoldAt: number }>()

  for (const order of orders) {
    const orderTimestamp = (() => {
      const timestamp = new Date(order.createdAt ?? order.updatedAt ?? Date.now()).getTime()
      return Number.isFinite(timestamp) ? timestamp : Date.now()
    })()

    if (!Array.isArray(order.items)) continue

    type OrderItemLike =
      | {
          productId?: unknown
          product?: { id?: unknown } | null
          quantity?: unknown
        }
      | null
      | undefined

    const normalizedItems = order.items as OrderItemLike[]

    for (const rawItem of normalizedItems) {
      if (!rawItem) continue

      const maybeProduct = rawItem.product
      const productIdRaw =
        typeof rawItem.productId === "string"
          ? rawItem.productId
          : maybeProduct &&
              typeof maybeProduct === "object" &&
              "id" in maybeProduct &&
              typeof (maybeProduct as { id: unknown }).id === "string"
            ? (maybeProduct as { id: string }).id
            : undefined

      if (!productIdRaw || !productMap.has(productIdRaw)) {
        continue
      }

      const quantityRaw = typeof rawItem.quantity === "number" ? rawItem.quantity : Number(rawItem.quantity)
      const units = Number.isFinite(quantityRaw) && quantityRaw > 0 ? quantityRaw : 1

      const previous = sales.get(productIdRaw)
      if (previous) {
        sales.set(productIdRaw, {
          units: previous.units + units,
          lastSoldAt: Math.max(previous.lastSoldAt, orderTimestamp),
        })
      } else {
        sales.set(productIdRaw, { units, lastSoldAt: orderTimestamp })
      }
    }
  }

  const bestSellers = Array.from(sales.entries())
    .map(([productId, stats]) => ({ productId, stats, product: productMap.get(productId)! }))
    .sort((a, b) => {
      if (b.stats.units !== a.stats.units) {
        return b.stats.units - a.stats.units
      }
      if (b.stats.lastSoldAt !== a.stats.lastSoldAt) {
        return b.stats.lastSoldAt - a.stats.lastSoldAt
      }
      return (b.product.reviewCount ?? 0) - (a.product.reviewCount ?? 0)
    })
    .map((entry) => entry.product)

  const fallbackRanking = [...productMap.values()].sort((a, b) => {
    if ((b.reviewCount ?? 0) !== (a.reviewCount ?? 0)) {
      return (b.reviewCount ?? 0) - (a.reviewCount ?? 0)
    }
    if ((b.rating ?? 0) !== (a.rating ?? 0)) {
      return (b.rating ?? 0) - (a.rating ?? 0)
    }
    const dateDiff =
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    if (Number.isFinite(dateDiff) && dateDiff !== 0) {
      return dateDiff
    }
    return a.name.localeCompare(b.name)
  })

  const result: Product[] = []
  const seen = new Set<string>()

  for (const product of bestSellers) {
    if (result.length >= safeLimit) break
    if (seen.has(product.id)) continue
    result.push(product)
    seen.add(product.id)
  }

  if (result.length < safeLimit) {
    for (const product of fallbackRanking) {
      if (result.length >= safeLimit) break
      if (seen.has(product.id)) continue
      result.push(product)
      seen.add(product.id)
    }
  }

  return result.slice(0, safeLimit)
}
