import { notFound } from "next/navigation"
import Image from "next/image"
import { Star, Check, Truck, RotateCcw } from "lucide-react"
import { getProductBySlug, getProducts } from "@/lib/api/products"
import { getReviewsByProductId } from "@/lib/api/reviews"
import { AddToCartForm } from "@/components/add-to-cart-form"
import { AddToWishlistButton } from "@/components/add-to-wishlist-button"
import { ProductCard } from "@/components/product-card"
import { ReviewCard } from "@/components/review-card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Metadata } from "next"
import { siteConfig, toAbsoluteUrl } from "@/lib/config/site"

const DEFAULT_PRODUCT_IMAGE = toAbsoluteUrl(siteConfig.defaultOgImagePath)
const ORG_NAME = siteConfig.name

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((product) => ({
    slug: product.slug,
  }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return {
      title: "Product Not Found",
    }
  }

  const canonicalUrl = toAbsoluteUrl(`/products/${product.slug}`)
  const images = (product.images?.length ? product.images : [DEFAULT_PRODUCT_IMAGE]).map((image) =>
    toAbsoluteUrl(image),
  )

  return {
    title: `${product.name} | ${siteConfig.name}`,
    description: product.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: product.name,
      description: product.description,
      url: canonicalUrl,
      images: images.map((url) => ({ url })),
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const allProducts = await getProducts()
  const relatedProducts = allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)
  const reviews = await getReviewsByProductId(product.id)

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  const canonicalUrl = toAbsoluteUrl(`/products/${product.slug}`)
  const productImageUrls = (product.images?.length ? product.images : [DEFAULT_PRODUCT_IMAGE]).map((image) =>
    toAbsoluteUrl(image),
  )

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: productImageUrls,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: ORG_NAME,
    },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "USD",
      price: product.price.toFixed(2),
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating.toFixed(1),
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {discount > 0 && (
              <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground">
                Save {discount}%
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {product.images.slice(1, 4).map((image, index) => (
              <div key={index} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} ${index + 2}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-3">
              {product.categoryLabel ?? product.category}
            </Badge>
            <h1 className="text-4xl font-bold mb-4 text-balance">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating) ? "fill-primary text-primary" : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
              {product.compareAtPrice && (
                <span className="text-xl text-muted-foreground line-through">${product.compareAtPrice.toFixed(2)}</span>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          <Separator />

          {/* Add to Cart */}
          <AddToCartForm product={product} />

          <AddToWishlistButton productId={product.id} />

          <Separator />

          {/* Features */}
          <div className="space-y-3">
            <h3 className="font-semibold">Key Features</h3>
            <ul className="space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Shipping & Returns */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Free Worldwide Shipping</p>
                <p className="text-sm text-muted-foreground">On all orders</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RotateCcw className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Easy Returns</p>
                <p className="text-sm text-muted-foreground">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mb-20">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Application Instructions</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.application}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Materials</h3>
                <ul className="space-y-2">
                  {product.materials.map((material, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {material}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-6">
              {/* Reviews Summary */}
              <div className="flex items-center gap-8 p-6 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{product.rating}</div>
                  <div className="flex mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating) ? "fill-primary text-primary" : "fill-muted text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">{reviews.length} reviews</div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-4">
                    Based on {reviews.length} verified customer reviews
                  </p>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = reviews.filter((r) => r.rating === rating).length
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                      return (
                        <div key={rating} className="flex items-center gap-2">
                          <span className="text-sm w-12">{rating} star</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>

              {reviews.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

