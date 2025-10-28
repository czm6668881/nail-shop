import type { MetadataRoute } from "next"
import { getProducts } from "@/lib/api/products"
import { getBlogPosts } from "@/lib/api/blog"

const HOST = "https://gelmanicure-nail.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/products",
    "/collections",
    "/about",
    "/blog",
    "/contact",
    "/shipping",
    "/returns",
    "/privacy",
    "/terms",
    "/sustainability",
    "/help",
  ].map((path) => ({
    url: `${HOST}${path}`,
    changefreq: "weekly",
    priority: path === "" ? 1 : 0.7,
  }))

  const [products, blogPosts] = await Promise.all([getProducts(), getBlogPosts()])

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${HOST}/products/${product.slug}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    changefreq: "weekly",
    priority: 0.8,
  }))

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${HOST}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : undefined,
    changefreq: "monthly",
    priority: 0.6,
  }))

  return [...staticRoutes, ...productRoutes, ...blogRoutes]
}
