import { listFeaturedReviews, listReviews, listReviewsByProductId } from "@/lib/db/queries"
import type { Review } from "@/types"

export async function getReviews(): Promise<Review[]> {
  return listReviews()
}

export async function getReviewsByProductId(productId: string): Promise<Review[]> {
  return listReviewsByProductId(productId)
}

export async function getFeaturedReviews(limit = 6): Promise<Review[]> {
  return listFeaturedReviews(limit)
}
