import { notFound } from "next/navigation"
import { getCollections, getProductsByCollection } from "@/lib/api/products"
import { ProductCard } from "@/components/product-card"
import type { Metadata } from "next"

interface CollectionPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const collections = await getCollections()
  return collections.map((collection) => ({
    slug: collection.slug,
  }))
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params
  const collections = await getCollections()
  const collection = collections.find((c) => c.slug === slug)

  if (!collection) {
    return {
      title: "Collection Not Found",
    }
  }

  return {
    title: `${collection.name} Collection - Luxe Nails`,
    description: collection.description,
  }
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params
  const collections = await getCollections()
  const collection = collections.find((c) => c.slug === slug)

  if (!collection) {
    notFound()
  }

  const products = await getProductsByCollection(collection.name)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{collection.name}</h1>
        <p className="text-lg text-muted-foreground">{collection.description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No products found in this collection.</p>
        </div>
      )}
    </div>
  )
}
