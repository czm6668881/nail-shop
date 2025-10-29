"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Upload, ImageIcon, X } from "lucide-react"
import { toast } from "sonner"
import { slugify } from "@/lib/utils/slug"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { BlogCategory, BlogPost } from "@/types"

const CATEGORY_OPTIONS: { value: BlogCategory; label: string }[] = [
  { value: "tutorial", label: "Tutorial" },
  { value: "tips", label: "Tips" },
  { value: "trends", label: "Trends" },
  { value: "care", label: "Care" },
  { value: "inspiration", label: "Inspiration" },
]

const EXCERPT_LIMIT = 160

const isValidCategory = (value: string): value is BlogCategory =>
  CATEGORY_OPTIONS.some((option) => option.value === value)

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ")

const estimateReadTime = (content: string) => {
  const words = stripHtml(content)
    .split(/\s+/)
    .filter((word) => word.length > 0)
  return Math.max(1, Math.ceil(words.length / 200))
}

export default function AdminBlogEditorPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const isNew = postId === "new"

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugDirty, setSlugDirty] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formState, setFormState] = useState({
    title: "",
    slug: "",
    excerpt: "",
    coverImage: "",
    category: CATEGORY_OPTIONS[0].value,
    authorName: "",
    authorAvatar: "",
    content: "",
    tags: "",
    published: false,
    readTime: "",
  })

  const formTitle = useMemo(() => (isNew ? "Create Blog Post" : "Edit Blog Post"), [isNew])

  const loadPost = useCallback(async () => {
    if (isNew) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/blog/${postId}`)
      if (!response.ok) {
        throw new Error("Unable to load blog post.")
      }
      const data = (await response.json()) as { post: BlogPost }
      const post = data.post
      setFormState({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: post.coverImage ?? "",
        category: post.category,
        authorName: post.author.name,
        authorAvatar: post.author.avatar ?? "",
        content: post.content,
        tags: post.tags.join(", "),
        published: post.published,
        readTime: post.readTime ? String(post.readTime) : "",
      })
      setSlugDirty(true)
      setError(null)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Unable to load blog post.")
    } finally {
      setLoading(false)
    }
  }, [isNew, postId])

  useEffect(() => {
    loadPost()
  }, [loadPost])

  const handleTitleChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      title: value,
      slug: !slugDirty ? slugify(value) : prev.slug,
    }))
  }

  const handleSlugChange = (value: string) => {
    setSlugDirty(true)
    setFormState((prev) => ({
      ...prev,
      slug: slugify(value),
    }))
  }

  const excerptCharactersRemaining = EXCERPT_LIMIT - formState.excerpt.length

  const handleExcerptChange = (value: string) => {
    setFormState((prev) => ({ ...prev, excerpt: value.slice(0, EXCERPT_LIMIT) }))
  }

  const generateExcerptFromContent = () => {
    if (!formState.content) {
      toast.error("Please add article content first")
      return
    }
    const plainText = stripHtml(formState.content).replace(/\s+/g, " ").trim()
    if (!plainText) {
      toast.error("Content is empty after removing formatting")
      return
    }
    const truncated = plainText.slice(0, EXCERPT_LIMIT)
    setFormState((prev) => ({ ...prev, excerpt: truncated }))
    toast.success("Excerpt generated from content")
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (saving) return

    const payload = {
      title: formState.title.trim(),
      slug: formState.slug.trim(),
      excerpt: formState.excerpt.trim().slice(0, EXCERPT_LIMIT),
      coverImage: formState.coverImage.trim(),
      category: formState.category,
      authorName: formState.authorName.trim(),
      authorAvatar: formState.authorAvatar.trim(),
      content: formState.content.trim(),
      tags: formState.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
      published: formState.published,
      readTime: formState.readTime.trim(),
    }

    if (!payload.title) {
      toast.error("Title is required")
      return
    }

    if (!payload.slug) {
      toast.error("Slug is required")
      return
    }

    if (!payload.excerpt) {
      toast.error("Excerpt is required")
      return
    }

    if (!payload.content) {
      toast.error("Content is required")
      return
    }

    if (!isValidCategory(payload.category)) {
      toast.error("Please select a valid category")
      return
    }

    const parsedReadTime = Number(payload.readTime)
    const finalReadTime = Number.isFinite(parsedReadTime) && parsedReadTime > 0
      ? Math.round(parsedReadTime)
      : estimateReadTime(payload.content)

    const apiPayload = {
      ...payload,
      readTime: finalReadTime,
    }

    setSaving(true)

    try {
      const url = isNew ? "/api/admin/blog" : `/api/admin/blog/${postId}`
      const method = isNew ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: "Unable to save blog post." }))
        throw new Error(errorBody?.message ?? "Unable to save blog post.")
      }

      toast.success(isNew ? "Blog post created" : "Blog post updated")
      router.push("/admin/blog")
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : "Unable to save blog post.")
    } finally {
      setSaving(false)
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Unsupported file type. Please upload JPG, PNG, GIF, or WebP images.")
      event.target.value = ""
      return
    }

    const maxSizeMb = 5
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`Image is too large. Maximum size is ${maxSizeMb}MB.`)
      event.target.value = ""
      return
    }

    setUploading(true)
    const toastId = toast.loading("Uploading cover image...")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        throw new Error(typeof errorBody.error === "string" ? errorBody.error : "Image upload failed")
      }

      const data = await response.json()
      setFormState((prev) => ({ ...prev, coverImage: data.url }))
      toast.success("Cover image uploaded")
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : "Unable to upload image.")
    } finally {
      toast.dismiss(toastId)
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveCover = () => {
    setFormState((prev) => ({ ...prev, coverImage: "" }))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-muted-foreground">Loading blog post…</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to blog posts
          </Link>
          <h1 className="text-3xl font-bold">{formTitle}</h1>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form className="grid gap-8" onSubmit={handleSubmit}>
        <section className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formState.title}
              onChange={(event) => handleTitleChange(event.target.value)}
              placeholder="How to create a gel manicure at home"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formState.slug}
              onChange={(event) => handleSlugChange(event.target.value)}
              placeholder="gel-manicure-at-home"
              required
            />
            <p className="text-xs text-muted-foreground">Used in the URL. We auto-generate it from the title, but you can customise it.</p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formState.excerpt}
              onChange={(event) => handleExcerptChange(event.target.value)}
              placeholder="A quick summary that appears on listing pages and search results."
              rows={3}
              required
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{excerptCharactersRemaining >= 0 ? `${excerptCharactersRemaining} characters remaining` : ""}</span>
              <Button type="button" variant="ghost" size="sm" onClick={generateExcerptFromContent}>
                Generate from content
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cover-image">Cover image URL</Label>
            <Input
              id="cover-image"
              value={formState.coverImage}
              onChange={(event) => setFormState((prev) => ({ ...prev, coverImage: event.target.value }))}
              placeholder="/blog-gel-manicure-steps.svg"
            />
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
              />
              <Button type="button" variant="outline" size="sm" onClick={handleFileSelect} disabled={uploading}>
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Uploading…" : "Upload from device"}
              </Button>
              {formState.coverImage && (
                <Button type="button" variant="ghost" size="sm" onClick={handleRemoveCover}>
                  <X className="mr-1 h-4 w-4" />
                  Remove
                </Button>
              )}
            </div>
            {formState.coverImage ? (
              <div className="relative mt-3 h-40 w-64 overflow-hidden rounded-md border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formState.coverImage} alt="Cover preview" className="h-full w-full object-cover" />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Upload or paste an image URL to feature at the top of the article.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formState.category}
              onValueChange={(value) => {
                if (isValidCategory(value)) {
                  setFormState((prev) => ({ ...prev, category: value }))
                }
              }}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="author-name">Author name</Label>
            <Input
              id="author-name"
              value={formState.authorName}
              onChange={(event) => setFormState((prev) => ({ ...prev, authorName: event.target.value }))}
              placeholder="Sophia Chen"
            />
            <p className="text-xs text-muted-foreground">Leave blank to credit with your own name later.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="author-avatar">Author avatar URL</Label>
            <Input
              id="author-avatar"
              value={formState.authorAvatar}
              onChange={(event) => setFormState((prev) => ({ ...prev, authorAvatar: event.target.value }))}
              placeholder="/placeholder.svg?height=100&width=100"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formState.tags}
              onChange={(event) => setFormState((prev) => ({ ...prev, tags: event.target.value }))}
              placeholder="gel, tutorial, diy"
            />
            <p className="text-xs text-muted-foreground">Separate tags with commas. They help with search filtering.</p>
          </div>
        </section>

        <section className="space-y-2">
          <Label htmlFor="content">Content (HTML supported)</Label>
          <Textarea
            id="content"
            value={formState.content}
            onChange={(event) => setFormState((prev) => ({ ...prev, content: event.target.value }))}
            rows={14}
            placeholder="Write your article using HTML headings, paragraphs, lists, and images."
            required
          />
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="read-time">Estimated read time (minutes)</Label>
            <Input
              id="read-time"
              type="number"
              min={1}
              value={formState.readTime}
              onChange={(event) => setFormState((prev) => ({ ...prev, readTime: event.target.value }))}
              placeholder="Let us estimate it for you"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to auto-calculate based on word count (200 words ≈ 1 minute).
            </p>
          </div>
          <div className="space-y-3">
            <Label htmlFor="published">Publish status</Label>
            <div className="flex items-center gap-3 rounded-md border border-border px-4 py-3">
              <Switch
                id="published"
                checked={formState.published}
                onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, published: checked }))}
              />
              <div>
                <p className="text-sm font-medium">{formState.published ? "Published" : "Draft"}</p>
                <p className="text-xs text-muted-foreground">
                  Published posts appear on the live site immediately after saving.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/blog")}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving…" : isNew ? "Create Post" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
