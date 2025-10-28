import { getBlogPost, getRelatedPosts } from "@/lib/api/blog"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Metadata } from "next"
import { siteConfig, toAbsoluteUrl } from "@/lib/config/site"

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  const canonicalUrl = toAbsoluteUrl(`/blog/${post.slug}`)
  const coverImageUrl = toAbsoluteUrl(post.coverImage || siteConfig.defaultOgImagePath)
  const pageTitle = `${post.title} | ${siteConfig.name} Blog`
  const description = post.excerpt
  const publishedAtIso = new Date(post.publishedAt).toISOString()
  const updatedAtIso = new Date(post.updatedAt ?? post.publishedAt).toISOString()

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      title: pageTitle,
      description,
      url: canonicalUrl,
      publishedTime: publishedAtIso,
      modifiedTime: updatedAtIso,
      authors: [post.author.name],
      images: [
        {
          url: coverImageUrl,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [coverImageUrl],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(post.id)
  const canonicalUrl = toAbsoluteUrl(`/blog/${post.slug}`)
  const coverImageUrl = toAbsoluteUrl(post.coverImage || siteConfig.defaultOgImagePath)
  const publishedAtIso = new Date(post.publishedAt).toISOString()
  const updatedAtIso = new Date(post.updatedAt ?? post.publishedAt).toISOString()
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: toAbsoluteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: toAbsoluteUrl("/blog"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: canonicalUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.excerpt,
      image: [coverImageUrl],
      author: {
        "@type": "Person",
        name: post.author.name,
      },
      publisher: {
        "@type": "Organization",
        name: siteConfig.name,
        logo: {
          "@type": "ImageObject",
          url: toAbsoluteUrl(siteConfig.defaultLogoPath),
        },
      },
      mainEntityOfPage: canonicalUrl,
      datePublished: publishedAtIso,
      dateModified: updatedAtIso,
    },
  ]

  const categoryLabels = {
    tutorial: "Tutorial",
    tips: "Tips",
    trends: "Trends",
    care: "Care",
    inspiration: "Inspiration",
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Button variant="ghost" asChild className="mb-8">
        <Link href="/blog">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>
      </Button>

      <article className="max-w-4xl mx-auto">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">{categoryLabels[post.category]}</Badge>
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">{post.title}</h1>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Image
                src={post.author.avatar || "/placeholder.svg"}
                alt={post.author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-medium">{post.author.name}</span>
            </div>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readTime} min read
            </span>
          </div>
        </div>

        <div className="relative h-[400px] mb-8 rounded-lg overflow-hidden">
          <Image src={post.coverImage || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
        </div>

        <div className="prose prose-lg max-w-none mb-12" dangerouslySetInnerHTML={{ __html: post.content }} />

        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="group">
                  <article className="h-full flex flex-col overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg">
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={relatedPost.coverImage || "/placeholder.svg"}
                        alt={relatedPost.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <Badge variant="secondary" className="w-fit mb-2">
                        {categoryLabels[relatedPost.category]}
                      </Badge>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{relatedPost.excerpt}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
