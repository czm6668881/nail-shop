import Link from "next/link"
import { Star, Camera, CheckCircle2 } from "lucide-react"
import { ReviewGallery } from "@/components/reviews/review-gallery"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getReviews } from "@/lib/api/reviews"
import { getProducts } from "@/lib/api/products"

export const metadata = {
  title: "All Reviews - gelmanicure",
  description: "Browse every authentic customer look and product experience so you can shop with confidence.",
}

export default async function ReviewsPage() {
  const [reviews, products] = await Promise.all([getReviews(), getProducts()])

  const productMap = new Map(
    products.map((product) => [
      product.id,
      {
        name: product.name,
        slug: product.slug,
        image: product.images[0],
      },
    ]),
  )

  const sortedReviews = [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const totalReviews = sortedReviews.length
  const averageRating =
    totalReviews > 0
      ? Math.round((sortedReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews) * 10) / 10
      : 0
  const reviewsWithPhotos = sortedReviews.filter((review) => review.images && review.images.length > 0).length
  const verifiedReviews = sortedReviews.filter((review) => review.verified).length

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = sortedReviews.filter((review) => review.rating === rating).length
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
    return { rating, count, percentage }
  })

  const reviewEntries = sortedReviews.map((review) => ({
    review,
    product: productMap.get(review.productId),
  }))

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <section className="max-w-3xl mx-auto text-center space-y-6">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Customer Stories</p>
        <h1 className="text-4xl font-bold tracking-tight">Authentic customer looks and experiences</h1>
        <p className="text-muted-foreground text-lg">
          See how shoppers style gelmanicure nails for everything from commutes to parties and gather fresh inspiration.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/products">Shop best sellers</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/products">Explore all styles</Link>
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="md:col-span-2 lg:col-span-1">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Average rating</p>
                <p className="text-3xl font-bold">{averageRating.toFixed(1)}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Based on {totalReviews} verified reviews</p>
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="w-12 text-sm text-muted-foreground">{rating} Stars</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="w-12 text-right text-sm text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <Camera className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Photos shared</p>
                <p className="text-2xl font-semibold">{reviewsWithPhotos}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {totalReviews > 0 ? Math.round((reviewsWithPhotos / totalReviews) * 100) : 0}% of customers uploaded manicure photos. Explore them for styling ideas.
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Verified reviews</p>
                <p className="text-2xl font-semibold">{verifiedReviews}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {totalReviews > 0 ? Math.round((verifiedReviews / totalReviews) * 100) : 0}% of reviews come from verified purchases, so you can trust the feedback.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">All reviews</h2>
          <p className="text-muted-foreground">Use the filters to find looks that match your style or a specific rating.</p>
        </div>

        <ReviewGallery entries={reviewEntries} />
      </section>

      <section className="text-center space-y-4">
        <h3 className="text-2xl font-semibold">Ready to show off your manicure?</h3>
        <p className="text-muted-foreground">Shop your favorites and upload your look from the order details page after checkout.</p>
        <Button size="lg" asChild>
          <Link href="/products">Shop now</Link>
        </Button>
      </section>
    </div>
  )
}
