import type { Product } from "@/types"

export interface CategoryFilterOption {
  id: string
  label: string
}

export interface PriceFilterOption {
  id: string
  label: string
  minimum: number
  maximum?: number
}

export interface AvailabilityFilterOption {
  id: string
  label: string
  predicate: (product: Product) => boolean
}

export const PRICE_FILTERS: PriceFilterOption[] = [
  { id: "under-25", label: "Under $25", minimum: 0, maximum: 25 },
  { id: "25-30", label: "$25 - $30", minimum: 25, maximum: 30 },
  { id: "30-35", label: "$30 - $35", minimum: 30, maximum: 35 },
  { id: "over-35", label: "Over $35", minimum: 35 },
]

export const AVAILABILITY_FILTERS: AvailabilityFilterOption[] = [
  {
    id: "in-stock",
    label: "In Stock",
    predicate: (product) => product.inStock,
  },
  {
    id: "on-sale",
    label: "On Sale",
    predicate: (product) => Boolean(product.compareAtPrice && product.compareAtPrice > product.price),
  },
]
