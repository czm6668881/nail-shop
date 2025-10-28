import { getBlogPosts } from "@/lib/api/blog"
import { BlogCard } from "@/components/blog-card"
import type { Metadata } from "next"
import { siteConfig, toAbsoluteUrl } from "@/lib/config/site"

const blogTitle = `Blog | ${siteConfig.name}`

export const metadata: Metadata = {
  title: blogTitle,
  description: "Tips, tutorials, and inspiration for beautiful nails. Learn from our experts.",
  alternates: {
    canonical: toAbsoluteUrl("/blog"),
  },
  openGraph: {
    title: blogTitle,
    description: "Tips, tutorials, and inspiration for beautiful nails. Learn from our experts.",
    type: "website",
    url: toAbsoluteUrl("/blog"),
  },
  twitter: {
    card: "summary_large_image",
    title: blogTitle,
    description: "Tips, tutorials, and inspiration for beautiful nails. Learn from our experts.",
  },
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Nail Care Blog</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Expert tips, tutorials, and inspiration for beautiful, healthy nails
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
