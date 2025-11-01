import Link from "next/link"
import { Sparkles, Clock, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { ReviewCard } from "@/components/review-card"
import { BlogCard } from "@/components/blog-card"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { HeroCarousel } from "@/components/hero-carousel"
import { getProducts, getBestSellingProducts } from "@/lib/api/products"
import { getFeaturedReviews } from "@/lib/api/reviews"
import { getBlogPosts } from "@/lib/api/blog"
import { getActiveHeroSlides } from "@/lib/api/hero-slides"
import { siteConfig, toAbsoluteUrl } from "@/lib/config/site"

const ORG_NAME = siteConfig.name
const DIAMOND_KEYWORDS = ["diamond", "crystal", "gem", "sparkle", "glitter", "chrome"] as const

export default async function HomePage() {
  const [allProducts, featuredReviews, blogPosts, heroSlides] = await Promise.all([
    getProducts(),
    getFeaturedReviews(4),
    getBlogPosts(),
    getActiveHeroSlides(),
  ])
  const bestSellers = await getBestSellingProducts(4, { seedProducts: allProducts })
  const latestPosts = blogPosts.slice(0, 3)
  const isDiamondThemed = (product: (typeof allProducts)[number]): boolean => {
    const featureValues = Array.isArray(product.features) ? product.features : []
    const searchPool = [
      product.name,
      product.description,
      product.slug,
      product.category,
      product.categoryLabel,
      product.collection,
      ...featureValues,
    ]
      .filter((value): value is string => typeof value === "string" && value.length > 0)
      .map((value) => value.toLowerCase())

    return searchPool.some((value) => DIAMOND_KEYWORDS.some((keyword) => value.includes(keyword)))
  }

  const diamondCandidates = allProducts.filter(isDiamondThemed)
  const diamondCategorySlug =
    diamondCandidates.find((product) => typeof product.category === "string" && product.category.length > 0)?.category ??
    undefined
  const diamondSpotlight = diamondCategorySlug
    ? allProducts.filter((product) => product.category === diamondCategorySlug).slice(0, 4)
    : diamondCandidates.slice(0, 4)
  const diamondLink = diamondCategorySlug
    ? `/products?category=${encodeURIComponent(diamondCategorySlug)}`
    : "/products?q=diamond"


  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORG_NAME,
    url: siteConfig.url,
    logo: toAbsoluteUrl(siteConfig.defaultLogoPath),
  }

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: ORG_NAME,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: toAbsoluteUrl(`/search?q={search_term_string}`),
      "query-input": "required name=search_term_string",
    },
  }

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationJsonLd, websiteJsonLd]) }}
      />
      {/* Hero Section with Carousel */}
      <HeroCarousel slides={heroSlides} />

      {/* Features */}
      <section className="border-b border-border bg-background/95 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card/90 p-5 shadow-sm transition hover:shadow-md md:flex-col md:items-center md:text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold md:text-xl">Premium Quality</p>
                <p className="text-sm text-muted-foreground text-pretty">
                  Gel tips crafted with salon-grade pigments, breathable bases, and comfort-fit curves.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card/90 p-5 shadow-sm transition hover:shadow-md md:flex-col md:items-center md:text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Clock className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold md:text-xl">Long-Lasting Wear</p>
                <p className="text-sm text-muted-foreground text-pretty">
                  Prep once, wear up to 7 days, and reapply with fresh gel tabs for repeat looks.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card/90 p-5 shadow-sm transition hover:shadow-md md:flex-col md:items-center md:text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Package className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold md:text-xl">Free Worldwide Delivery</p>
                <p className="text-sm text-muted-foreground text-pretty">
                  Complimentary tracked shipping plus eco packaging that cushions every set.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Gel nails */}
      <section className="bg-background py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">Best Sellers Gel nails</h2>
              <p className="text-sm text-muted-foreground md:max-w-2xl md:text-lg">
                Our community-favorite sets with the highest reviews and repeat purchases.
              </p>
            </div>
            <Button size="sm" variant="outline" className="hidden rounded-full md:inline-flex" asChild>
              <Link href="/products?filter=bestsellers">Browse All Best Sellers</Link>
            </Button>
          </div>
          {bestSellers.length > 0 ? (
            <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto pb-4 md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible lg:grid-cols-4">
              {bestSellers.map((product) => (
                <div
                  key={product.id}
                  className="min-w-[220px] max-w-[260px] flex-shrink-0 md:min-w-0 md:max-w-none"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-8 rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
              We&apos;re gathering your favorite looks. Explore the catalog to find your next go-to set.
            </div>
          )}
          <div className="mt-6 text-center md:hidden">
            <Button size="lg" variant="outline" className="rounded-full" asChild>
              <Link href="/products?filter=bestsellers">查看更多热销款</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Diamond Gel Nails */}
      <section className="border-b border-border bg-muted/20 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">Diamond Gel Nails</h2>
              <p className="text-sm text-muted-foreground md:max-w-2xl md:text-lg">
                Radiant gemstone-inspired sets with brilliant facets and high-shine gel finishes.
              </p>
            </div>
            <Button size="sm" className="hidden rounded-full md:inline-flex" asChild>
              <Link href={diamondLink}>Shop Diamond Styles</Link>
            </Button>
          </div>
          {diamondSpotlight.length > 0 ? (
            <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto pb-4 md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible lg:grid-cols-4">
              {diamondSpotlight.map((product) => (
                <div key={product.id} className="min-w-[220px] max-w-[260px] flex-shrink-0 md:min-w-0 md:max-w-none">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-8 rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
              Our diamond capsule is almost here. Subscribe below to be first in line when it drops.
            </div>
          )}
          <div className="mt-6 text-center md:hidden">
            <Button size="lg" className="w-full rounded-full" asChild>
              <Link href={diamondLink}>探索钻石系列</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="bg-background py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">What Our Customers Say</h2>
              <p className="text-sm text-muted-foreground md:text-lg">Real reviews from real customers</p>
            </div>
            <Button size="sm" className="hidden rounded-full md:inline-flex" asChild>
              <Link href="/reviews">View All Reviews</Link>
            </Button>
          </div>
          {featuredReviews.length > 0 ? (
            <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto pb-4 md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible lg:grid-cols-4">
              {featuredReviews.map((review) => (
                <div
                  key={review.id}
                  className="min-w-[240px] max-w-[300px] flex-shrink-0 md:min-w-0 md:max-w-none"
                >
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-8 rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
              New customer stories are on their way. Be the first to share your experience with our designs.
            </div>
          )}
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" variant="outline" className="w-full rounded-full sm:w-auto" asChild>
              <Link href="/products">立即选购</Link>
            </Button>
            <Button size="lg" variant="ghost" className="w-full rounded-full sm:w-auto" asChild>
              <Link href="/reviews">查看更多评价</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="border-t border-border bg-muted/20 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">Fresh From the Blog</h2>
              <p className="text-sm text-muted-foreground md:text-lg">
                Tutorials, inspiration, and tips from our nail care experts
              </p>
            </div>
            <Button size="sm" variant="outline" className="hidden rounded-full md:inline-flex" asChild>
              <Link href="/blog">Read All Articles</Link>
            </Button>
          </div>
          {latestPosts.length > 0 ? (
            <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto pb-4 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
              {latestPosts.map((post) => (
                <div
                  key={post.id}
                  className="min-w-[240px] max-w-[320px] flex-shrink-0 md:min-w-0 md:max-w-none"
                >
                  <BlogCard post={post} variant="compact" />
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-10 rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
              We&apos;re preparing new stories for you. Visit our blog for more nail care inspiration.
            </div>
          )}
          <div className="mt-6 text-center md:hidden">
            <Button size="lg" variant="outline" className="w-full rounded-full" asChild>
              <Link href="/blog">阅读更多文章</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-primary/10 rounded-2xl p-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Join Our Community</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get exclusive access to new collections, special offers, and nail care tips
            </p>
            <NewsletterSignup />
          </div>
        </div>
      </section>
    </div>
  )
}
