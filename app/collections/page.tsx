import { getCollections } from "@/lib/api/products"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Collections - Luxe Nails",
  description: "Browse our curated collections of premium press-on nails. Find the perfect style for every occasion.",
}

export default async function CollectionsPage() {
  const collections = await getCollections()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Our Collections</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore our carefully curated collections, each designed to complement your unique style and occasion
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.slug}`}
            className="group relative h-[400px] overflow-hidden rounded-lg"
          >
            <Image
              src={collection.image || "/placeholder.svg"}
              alt={collection.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">{collection.name}</h2>
              <p className="text-sm text-white/90 mb-3">{collection.description}</p>
              <span className="text-sm font-medium group-hover:underline">
                Explore {collection.productCount} Products →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
