import type { MetadataRoute } from "next"
import { getProducts } from "@/lib/api/products"
import { getBlogPosts } from "@/lib/api/blog"
import { toAbsoluteUrl } from "@/lib/config/site"

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
    url: toAbsoluteUrl(path),
    changefreq: "weekly",
    priority: path === "" ? 1 : 0.7,
  }))

  const [products, blogPosts] = await Promise.all([getProducts(), getBlogPosts()])

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: toAbsoluteUrl(`/products/${product.slug}`),
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    changefreq: "weekly",
    priority: 0.8,
  }))

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: toAbsoluteUrl(`/blog/${post.slug}`),
    lastModified: post.updatedAt ? new Date(post.updatedAt) : undefined,
    changefreq: "monthly",
    priority: 0.6,
  }))

  return [...staticRoutes, ...productRoutes, ...blogRoutes]
}
