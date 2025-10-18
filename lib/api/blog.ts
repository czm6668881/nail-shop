import { findBlogPostBySlug, listBlogPosts, listRelatedBlogPosts } from "@/lib/db/queries"
import type { BlogPost, BlogCategory } from "@/types"

export async function getBlogPosts(category?: BlogCategory): Promise<BlogPost[]> {
  const posts = await listBlogPosts(true)
  if (!category) {
    return posts
  }
  return posts.filter((post) => post.category === category)
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  return findBlogPostBySlug(slug, true)
}

export async function getRelatedPosts(postId: string, limit = 3): Promise<BlogPost[]> {
  return listRelatedBlogPosts(postId, limit)
}
