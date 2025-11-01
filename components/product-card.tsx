import Link from "next/link"
import Image from "next/image"
import { Star } from "lucide-react"
import type { Product } from "@/types"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  return (
    <Link href={`/products/${product.slug}`} className="group block h-full">
      <div className="flex h-full flex-col space-y-3 rounded-2xl border border-border/60 bg-card/95 p-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {discount > 0 && (
            <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">-{discount}%</Badge>
          )}
          {!product.inStock && (
            <Badge className="absolute top-3 left-3 bg-muted text-muted-foreground">Out of Stock</Badge>
          )}
        </div>

        {/* Info */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold leading-snug text-balance transition-colors group-hover:text-primary">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(product.rating) ? "fill-primary text-primary" : "fill-muted text-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-foreground">${product.price.toFixed(2)}</span>
            {product.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through">${product.compareAtPrice.toFixed(2)}</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded bg-primary/15 px-1.5 py-0.5 font-semibold uppercase text-primary">Fast ship</span>
            <span>Free returns available</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
