import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock } from "lucide-react"
import type { BlogPost } from "@/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const CATEGORY_LABELS: Record<BlogPost["category"], string> = {
  tutorial: "Tutorial",
  tips: "Tips",
  trends: "Trends",
  care: "Care",
  inspiration: "Inspiration",
}

interface BlogCardProps {
  post: BlogPost
  variant?: "default" | "compact"
}

export function BlogCard({ post, variant = "default" }: BlogCardProps) {
  const isCompact = variant === "compact"
  const publishedDate =
    post.publishedAt && !Number.isNaN(Date.parse(post.publishedAt)) ? new Date(post.publishedAt) : null

  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <article
        className={cn(
          "h-full overflow-hidden rounded-lg border bg-card transition-all duration-200 hover:shadow-lg",
          isCompact ? "flex flex-col border-border/70 bg-card/60" : "flex flex-col",
        )}
      >
        <div className={cn("relative overflow-hidden", isCompact ? "h-40" : "h-48")}>
          <Image
            src={post.coverImage || "/placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={isCompact ? "(max-width: 768px) 100vw, 33vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
            priority={isCompact}
          />
        </div>
        <div className="flex-1 p-6">
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-muted-foreground">
            <Badge variant="secondary">{CATEGORY_LABELS[post.category]}</Badge>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime} min read
            </span>
            {publishedDate && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {publishedDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
          <h3
            className={cn(
              "font-semibold transition-colors group-hover:text-primary",
              isCompact ? "text-lg mb-2 line-clamp-2" : "text-xl mb-3 line-clamp-2",
            )}
          >
            {post.title}
          </h3>
          <p
            className={cn(
              "text-muted-foreground",
              isCompact ? "text-sm line-clamp-3" : "text-sm mb-4 line-clamp-3",
            )}
          >
            {post.excerpt}
          </p>
          <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
            <Image
              src={post.author.avatar || "/placeholder.svg"}
              alt={post.author.name}
              width={28}
              height={28}
              className="rounded-full"
            />
            <span>{post.author.name}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
