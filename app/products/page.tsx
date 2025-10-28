import { Suspense } from "react"
import type { Metadata } from "next"
import { getProducts, getProductCategories } from "@/lib/api/products"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import {
  AVAILABILITY_FILTERS,
  PRICE_FILTERS,
} from "@/lib/config/product-filters"
import type { Product } from "@/types"
import { siteConfig, toAbsoluteUrl } from "@/lib/config/site"

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

const truncateQuery = (value: string): string =>
  value.length > 60 ? `${value.slice(0, 57)}...` : value

const derivePageCopy = (sortKey?: string, query?: string) => {
  const trimmedQuery = query?.trim()
  if (trimmedQuery && trimmedQuery.length > 0) {
    const truncatedQuery = truncateQuery(trimmedQuery)
    return {
      pageTitle: `Search Results for "${truncatedQuery}"`,
      pageDescription:
        "Explore premium press-on nails that match your search. Refine the filters to narrow down finish, length, and availability.",
    }
  }

  if (sortKey === "new") {
    return {
      pageTitle: "New Arrivals",
      pageDescription:
        "See the latest designs added to our collection of premium press-on nails. Fresh styles drop weekly.",
    }
  }

  if (sortKey === "bestsellers") {
    return {
      pageTitle: "Best Sellers Gel nails",
      pageDescription:
        "Shop the gel nail sets customers love most—from everyday neutrals to statement finishes that sell out fast.",
    }
  }

  return {
    pageTitle: "All Products",
    pageDescription: "Discover our complete collection of premium press-on nails.",
  }
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  const sortKey =
    typeof resolvedSearchParams.filter === "string" ? resolvedSearchParams.filter : undefined
  const rawQuery = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q.trim() : ""
  const { pageTitle, pageDescription } = derivePageCopy(sortKey, rawQuery)
  const canonicalUrl = toAbsoluteUrl("/products")
  const fullTitle = `${pageTitle} | ${siteConfig.name}`

  return {
    title: fullTitle,
    description: pageDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description: pageDescription,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: pageDescription,
    },
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams
  const [allProducts, productCategories] = await Promise.all([
    getProducts(),
    getProductCategories(),
  ])

  const selectedCategories = toArray(resolvedSearchParams.category)
  const selectedPrices = toArray(resolvedSearchParams.price)
  const selectedAvailability = toArray(resolvedSearchParams.availability)
  const rawQuery =
    typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q.trim() : ""
  const normalizedQuery = rawQuery.toLowerCase()
  const sortKey =
    typeof resolvedSearchParams.filter === "string" ? resolvedSearchParams.filter : undefined

  const { pageTitle, pageDescription } = derivePageCopy(sortKey, rawQuery)

  const filteredProducts = applySort(
    allProducts.filter((product) => {
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(product.category)
      const matchesPrice = matchesPriceRange(product, selectedPrices)
      const matchesAvailabilityFilters = matchesAvailability(product, selectedAvailability)
      const matchesQuery =
        normalizedQuery.length === 0 ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery)

      return matchesCategory && matchesPrice && matchesAvailabilityFilters && matchesQuery
    }),
    sortKey,
  )
  const categoryOptions = productCategories.map((category) => ({
    id: category.slug,
    label: category.name,
  }))

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{pageTitle}</h1>
        <p className="text-lg text-muted-foreground">{pageDescription}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <Suspense fallback={<div>Loading filters...</div>}>
            <ProductFilters
              selectedCategories={selectedCategories}
              selectedPrices={selectedPrices}
              selectedAvailability={selectedAvailability}
              categories={categoryOptions}
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
