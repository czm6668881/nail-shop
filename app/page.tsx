import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Sparkles, Clock, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { ReviewCard } from "@/components/review-card"
import { BlogCard } from "@/components/blog-card"
import { NewsletterSignup } from "@/components/newsletter-signup"
import { HeroCarousel } from "@/components/hero-carousel"
import { getProducts, getFeaturedCollections } from "@/lib/api/products"
import { getFeaturedReviews } from "@/lib/api/reviews"
import { getBlogPosts } from "@/lib/api/blog"
import { getActiveHeroSlides } from "@/lib/api/hero-slides"

export default async function HomePage() {
  const [allProducts, featuredCollections, featuredReviews, blogPosts, heroSlides] = await Promise.all([
    getProducts(),
    getFeaturedCollections(),
    getFeaturedReviews(4),
    getBlogPosts(),
    getActiveHeroSlides(),
  ])
  const latestPosts = blogPosts.slice(0, 3)
  const bestSellers = allProducts
    .slice()
    .sort((a, b) => {
      if (b.reviewCount !== a.reviewCount) {
        return b.reviewCount - a.reviewCount
      }
      return b.rating - a.rating
    })
    .slice(0, 4)

  return (
    <div className="flex flex-col">
      {/* Hero Section with Carousel */}
      <HeroCarousel slides={heroSlides} />

      {/* Features */}
      <section className="py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Premium Quality</h3>
              <p className="text-sm text-muted-foreground text-pretty">
                Salon-quality materials and finishes that look and feel luxurious
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Long-Lasting Wear</h3>
              <p className="text-sm text-muted-foreground text-pretty">
                Enjoy beautiful nails for a full week with proper application and gentle removal
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Free Shipping</h3>
              <p className="text-sm text-muted-foreground text-pretty">Complimentary tracked shipping on every order worldwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Best Sellers</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our community-favorite sets with the highest reviews and repeat purchases.
            </p>
          </div>
          {bestSellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mb-8 rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
              We&apos;re gathering your favorite looks. Explore the catalog to find your next go-to set.
            </div>
          )}
          <div className="text-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/products?filter=bestsellers">Browse Best Sellers</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Shop by Collection</h2>
            <p className="text-muted-foreground text-lg">Curated sets for every style and occasion</p>
          </div>
          {featuredCollections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCollections.map((collection) => (
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{collection.name}</h3>
                    <p className="text-sm text-white/90 mb-3">{collection.description}</p>
                    <span className="flex items-center text-sm font-medium group-hover:underline">
                      Shop {collection.productCount} Products
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
              Our stylists are crafting new collections. Check back soon or explore all products in the meantime.
            </div>
          )}
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-muted-foreground text-lg">Real reviews from real customers</p>
          </div>
          {featuredReviews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {featuredReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="mb-8 rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
              New customer stories are on their way. Be the first to share your experience with our designs.
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" variant="outline" asChild>
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link href="/reviews">View All Reviews</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Fresh From the Blog</h2>
            <p className="text-muted-foreground text-lg">
              Tutorials, inspiration, and tips from our nail care experts
            </p>
          </div>
          {latestPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {latestPosts.map((post) => (
                <BlogCard key={post.id} post={post} variant="compact" />
              ))}
            </div>
          ) : (
            <div className="mb-10 rounded-2xl border border-dashed py-16 text-center text-muted-foreground">
              We&apos;re preparing new stories for you. Visit our blog for more nail care inspiration.
            </div>
          )}
          <div className="text-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/blog">Read All Articles</Link>
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
