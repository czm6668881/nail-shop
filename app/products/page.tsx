import { Suspense } from "react"
import type { Metadata } from "next"
import { getProducts } from "@/lib/api/products"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import {
  AVAILABILITY_FILTERS,
  PRICE_FILTERS,
} from "@/lib/config/product-filters"
import type { Product } from "@/types"

export const metadata: Metadata = {
  title: "Shop All Products - Luxe Nails",
  description:
    "Browse our complete collection of premium press-on nails. Find the perfect style for any occasion with free shipping on orders over $50.",
}

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const toArray = (value: string | string[] | undefined): string[] => {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

const matchesPriceRange = (product: Product, rangeIds: string[]): boolean => {
  if (rangeIds.length === 0) {
    return true
  }

  return rangeIds.some((rangeId) => {
    const range = PRICE_FILTERS.find((option) => option.id === rangeId)
    if (!range) return false

    const minimumMatch = product.price >= range.minimum
    const maximumMatch = range.maximum !== undefined ? product.price < range.maximum : true

    return minimumMatch && maximumMatch
  })
}

const matchesAvailability = (product: Product, availabilityIds: string[]): boolean => {
  if (availabilityIds.length === 0) {
    return true
  }

  return availabilityIds.some((availabilityId) => {
    const option = AVAILABILITY_FILTERS.find((filter) => filter.id === availabilityId)
    return option ? option.predicate(product) : false
  })
}

const applySort = (products: Product[], sortKey?: string): Product[] => {
  if (!sortKey) {
    return products
  }

  const sorted = [...products]

  switch (sortKey) {
    case "new":
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    case "bestsellers":
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount)
    default:
      return products
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams
  const allProducts = await getProducts()

  const selectedCategories = toArray(resolvedSearchParams.category)
  const selectedPrices = toArray(resolvedSearchParams.price)
  const selectedAvailability = toArray(resolvedSearchParams.availability)
  const query =
    typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q.trim().toLowerCase() : ""
  const sortKey =
    typeof resolvedSearchParams.filter === "string" ? resolvedSearchParams.filter : undefined

  const filteredProducts = applySort(
    allProducts.filter((product) => {
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(product.category)
      const matchesPrice = matchesPriceRange(product, selectedPrices)
      const matchesAvailabilityFilters = matchesAvailability(product, selectedAvailability)
      const matchesQuery =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)

      return matchesCategory && matchesPrice && matchesAvailabilityFilters && matchesQuery
    }),
    sortKey,
  )

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">All Products</h1>
        <p className="text-lg text-muted-foreground">
          Discover our complete collection of premium press-on nails
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <Suspense fallback={<div>Loading filters...</div>}>
            <ProductFilters
              selectedCategories={selectedCategories}
              selectedPrices={selectedPrices}
              selectedAvailability={selectedAvailability}
            />
          </Suspense>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No products match your selection. Try adjusting your filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
