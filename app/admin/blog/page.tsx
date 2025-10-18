"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react"
import type { BlogPost, BlogCategory } from "@/types"

const categoryLabels: Record<BlogCategory, string> = {
  tutorial: "Tutorial",
  tips: "Tips",
  trends: "Trends",
  care: "Care",
  inspiration: "Inspiration",
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/blog")
      if (!response.ok) {
        throw new Error("Unable to load blog posts.")
      }
      const data = await response.json()
      setPosts(data.posts)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load blog posts.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return
    try {
      const response = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" })
      if (!response.ok) {
        throw new Error("Unable to delete post.")
      }
      setPosts((prev) => prev.filter((post) => post.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to delete post.")
    }
  }

  const togglePublish = async (id: string, nextState: boolean) => {
    try {
      const response = await fetch(`/api/admin/blog/${id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: nextState }),
      })
      if (!response.ok) {
        throw new Error("Unable to update publish status.")
      }
      setPosts((prev) => prev.map((post) => (post.id === id ? { ...post, published: nextState } : post)))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to update publish status.")
    }
  }

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === "all" || post.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [posts, searchQuery, categoryFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground">Manage your blog content</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {error && <div className="text-destructive">{error}</div>}

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            disabled={loading}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={loading}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="tutorial">Tutorial</SelectItem>
            <SelectItem value="tips">Tips</SelectItem>
            <SelectItem value="trends">Trends</SelectItem>
            <SelectItem value="care">Care</SelectItem>
            <SelectItem value="inspiration">Inspiration</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>{post.author.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{categoryLabels[post.category]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={post.published ? "default" : "outline"}>
                    {post.published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => togglePublish(post.id, !post.published)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Loading posts...
                </TableCell>
              </TableRow>
            )}
            {!loading && filteredPosts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No posts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredPosts.length} of {posts.length} posts
      </div>
    </div>
  )
}
