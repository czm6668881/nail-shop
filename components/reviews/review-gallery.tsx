"use client"

import { useMemo, useState } from "react"
import { ReviewCard } from "@/components/review-card"
import { Button } from "@/components/ui/button"
import type { Review } from "@/types"

type ReviewEntry = {
  review: Review
  product?: {
    name: string
    slug?: string
    image?: string
  }
}

interface ReviewGalleryProps {
  entries: ReviewEntry[]
}

const RATING_OPTIONS = [5, 4, 3, 2, 1] as const

export function ReviewGallery({ entries }: ReviewGalleryProps) {
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all")
  const [withPhotosOnly, setWithPhotosOnly] = useState(false)
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  const filteredEntries = useMemo(() => {
    return entries.filter(({ review }) => {
      if (ratingFilter !== "all" && review.rating !== ratingFilter) {
        return false
      }

      if (withPhotosOnly && (!review.images || review.images.length === 0)) {
        return false
      }

      if (verifiedOnly && !review.verified) {
        return false
      }

      return true
    })
  }, [entries, ratingFilter, withPhotosOnly, verifiedOnly])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={ratingFilter === "all" ? "default" : "outline"}
            onClick={() => setRatingFilter("all")}
          >
            全部评分
          </Button>
          {RATING_OPTIONS.map((rating) => (
            <Button
              key={rating}
              size="sm"
              variant={ratingFilter === rating ? "default" : "outline"}
              onClick={() => setRatingFilter(rating)}
            >
              {rating} 星
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={withPhotosOnly ? "default" : "outline"}
            onClick={() => setWithPhotosOnly((prev) => !prev)}
          >
            仅看带图
          </Button>
          <Button
            size="sm"
            variant={verifiedOnly ? "default" : "outline"}
            onClick={() => setVerifiedOnly((prev) => !prev)}
          >
            仅看已验证
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEntries.map(({ review, product }) => (
          <ReviewCard key={review.id} review={review} product={product} />
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16">
          <p className="text-muted-foreground mb-2">暂时没有符合条件的评论。</p>
          <p className="text-sm text-muted-foreground">试试更换筛选条件。</p>
        </div>
      )}
    </div>
  )
}
