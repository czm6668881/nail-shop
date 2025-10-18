import type { Metadata } from "next"
import Link from "next/link"
import { searchProducts } from "@/lib/api/products"
import { ProductCard } from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Search Products - gelmanicure",
  description: "Search our collection of premium press-on nails by style, finish, or collection.",
}

interface SearchPageProps {
  searchParams: Record<string, string | string[] | undefined>
}

const getQuery = (value: string | string[] | undefined): string => {
  if (!value) return ""
  return Array.isArray(value) ? value[0] ?? "" : value
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = getQuery(searchParams.q).trim()
  const results = query ? await searchProducts(query) : []

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">Search Products</h1>
          <p className="text-lg text-muted-foreground">
            Discover press-on nails that match your style. Search by color, finish, or collection.
          </p>
        </div>

        <form className="flex flex-col sm:flex-row gap-3 mb-12">
          <Input
            name="q"
            defaultValue={query}
            placeholder="Search for French tips, chrome, ombre..."
            className="flex-1"
          />
          <Button type="submit" size="lg">
            Search
          </Button>
        </form>

        {query.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
            Enter a keyword above to see matching products.
          </div>
        )}

        {query.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {results.length} {results.length === 1 ? "result" : "results"} for “{query}”
              </p>
              <Button variant="link" className="px-0" asChild>
                <Link href={`/products?q=${encodeURIComponent(query)}`}>View in Products Grid</Link>
              </Button>
            </div>

            {results.length === 0 ? (
              <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
                No products found. Try a different search term.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
