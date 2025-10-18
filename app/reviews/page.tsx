import Link from "next/link"
import { Star, Camera, CheckCircle2 } from "lucide-react"
import { ReviewGallery } from "@/components/reviews/review-gallery"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getReviews } from "@/lib/api/reviews"
import { getProducts } from "@/lib/api/products"

export const metadata = {
  title: "全部评论 - gelmanicure",
  description: "浏览所有真实买家秀与产品体验，让你更安心挑选心仪美甲。",
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
        <h1 className="text-4xl font-bold tracking-tight">真实买家秀与体验</h1>
        <p className="text-muted-foreground text-lg">
          看看大家如何将 gelmanicure 的美甲新品玩出花样，从日常通勤到派对聚会，灵感满满。
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/products">选购热销款</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/collections">浏览全部系列</Link>
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">平均评分</p>
                <p className="text-3xl font-bold">{averageRating.toFixed(1)}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">基于 {totalReviews} 位买家真实反馈</p>
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="w-12 text-sm text-muted-foreground">{rating} 星</span>
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
                <p className="text-sm text-muted-foreground">带图晒单</p>
                <p className="text-2xl font-semibold">{reviewsWithPhotos}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {totalReviews > 0 ? Math.round((reviewsWithPhotos / totalReviews) * 100) : 0}% 的买家上传了美甲实拍，快来寻找搭配灵感。
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">已验证评价</p>
                <p className="text-2xl font-semibold">{verifiedReviews}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {totalReviews > 0 ? Math.round((verifiedReviews / totalReviews) * 100) : 0}% 的评论来自真实下单的顾客，放心种草。
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">全部评论</h2>
          <p className="text-muted-foreground">
            使用筛选功能，快速找到与你风格契合的买家秀或特定评分。
          </p>
        </div>

        <ReviewGallery entries={reviewEntries} />
      </section>

      <section className="text-center space-y-4">
        <h3 className="text-2xl font-semibold">也想晒出你的美甲灵感？</h3>
        <p className="text-muted-foreground">
          立即选购喜欢的款式，完成下单后即可在订单详情页上传你的专属买家秀。
        </p>
        <Button size="lg" asChild>
          <Link href="/products">马上选购</Link>
        </Button>
      </section>
    </div>
  )
}
