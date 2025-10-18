import Link from "next/link"
import Image from "next/image"
import { Star, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Review } from "@/types"

interface ReviewCardProps {
  review: Review
  product?: {
    name: string
    slug?: string
    image?: string
  }
}

export function ReviewCard({ review, product }: ReviewCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{review.userName}</span>
              {review.verified && (
                <span title="Verified Purchase">
                  <CheckCircle className="h-4 w-4 text-primary" aria-hidden="true" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? "fill-primary text-primary" : "fill-muted text-muted"}`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        <h4 className="font-semibold mb-2">{review.title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{review.comment}</p>

        {review.images && review.images.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {review.images.map((image, index) => (
              <div key={index} className="relative aspect-square overflow-hidden rounded-md bg-muted">
                <Image
                  src={image || "/placeholder.svg?height=200&width=200"}
                  alt={`Customer photo ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {product && (
          <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="flex flex-col">
              {product.slug ? (
                <Link
                  href={`/products/${product.slug}`}
                  className="text-sm font-semibold hover:text-primary transition-colors"
                >
                  {product.name}
                </Link>
              ) : (
                <span className="text-sm font-semibold">{product.name}</span>
              )}
              <span className="text-xs text-muted-foreground">
                {product.slug ? "View product details" : "Featured design"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
