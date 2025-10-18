import { Star, CheckCircle, XCircle, Eye } from "lucide-react"
import { getReviews } from "@/lib/api/reviews"
import { getProducts } from "@/lib/api/products"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

export default async function AdminReviewsPage() {
  const reviews = await getReviews()
  const products = await getProducts()

  // Calculate stats
  const totalReviews = reviews.length
  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
  const verifiedReviews = reviews.filter((r) => r.verified).length
  const reviewsWithPhotos = reviews.filter((r) => r.images && r.images.length > 0).length

  // Get product name by ID
  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    return product?.name || "Unknown Product"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Reviews Management</h1>
        <p className="text-muted-foreground">Manage customer reviews and testimonials</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Out of 5 stars</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Reviews</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedReviews}</div>
            <p className="text-xs text-muted-foreground">
              {((verifiedReviews / totalReviews) * 100).toFixed(0)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Photos</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewsWithPhotos}</div>
            <p className="text-xs text-muted-foreground">
              {((reviewsWithPhotos / totalReviews) * 100).toFixed(0)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input placeholder="Search reviews..." className="md:max-w-sm" />
            <Select defaultValue="all">
              <SelectTrigger className="md:w-[180px]">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
                <SelectItem value="with-photos">With Photos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Photos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">{review.userName}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{getProductName(review.productId)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span>{review.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <div>
                      <div className="font-medium text-sm mb-1">{review.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">{review.comment}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {review.images && review.images.length > 0 ? (
                      <div className="flex gap-1">
                        {review.images.slice(0, 3).map((image, idx) => (
                          <div key={idx} className="relative h-10 w-10 rounded overflow-hidden bg-muted">
                            <Image
                              src={image || "/placeholder.svg"}
                              alt={`Review photo ${idx + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                        {review.images.length > 3 && (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs">
                            +{review.images.length - 3}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No photos</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {review.verified ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Unverified</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
