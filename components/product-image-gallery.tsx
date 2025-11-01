"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const MEASUREMENT_IMAGE = "/images/nail-measurement-guide.jpeg"

type ProductImageGalleryProps = {
  name: string
  images: string[]
  discount?: number
}

export function ProductImageGallery({ name, images, discount = 0 }: ProductImageGalleryProps) {
  const galleryImages = useMemo(() => {
    const normalized = images?.length ? images : ["/placeholder.svg?height=600&width=600"]
    const unique = normalized.filter((value, index) => normalized.indexOf(value) === index)
    if (!unique.includes(MEASUREMENT_IMAGE)) {
      unique.push(MEASUREMENT_IMAGE)
    }
    return unique
  }, [images])

  const [selectedIndex, setSelectedIndex] = useState(0)

  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const selectedImage = galleryImages[selectedIndex] ?? MEASUREMENT_IMAGE
  const isMeasurementImage = selectedImage === MEASUREMENT_IMAGE

  return (
    <div className="space-y-4">
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="group relative aspect-square w-full overflow-hidden rounded-lg bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
            aria-label="Open product image preview"
          >
            <Image
              src={selectedImage}
              alt={isMeasurementImage ? "Nail measurement tutorial" : `${name} image`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(min-width: 768px) 50vw, 100vw"
              priority
            />
            {!isMeasurementImage && discount > 0 && (
              <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground">
                Save {discount}%
              </Badge>
            )}
            <span className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
              View larger
            </span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-[96vw] border-0 bg-transparent p-2 shadow-none sm:max-w-[96vw] lg:max-w-[90vw] xl:max-w-[80vw]">
          <div className="relative h-[88vh] w-full overflow-hidden rounded-lg bg-white">
            <Image
              src={selectedImage}
              alt={isMeasurementImage ? "Nail measurement tutorial full view" : `${name} large image`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-3 gap-4">
        {galleryImages.map((image, index) => {
          const isActive = index === selectedIndex
          const isMeasurement = image === MEASUREMENT_IMAGE
          return (
            <button
              type="button"
              key={`${image}-${index}`}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg bg-muted transition ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring",
                isActive ? "ring-2 ring-primary" : "hover:ring-2 hover:ring-primary/50",
              )}
              aria-label={isMeasurement ? "View nail sizing guide" : `View ${name} image ${index + 1}`}
            >
              <Image
                src={image}
                alt={isMeasurement ? "Nail measurement tutorial thumbnail" : `${name} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 15vw, 30vw"
              />
              {isMeasurement && (
                <span className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
                  Sizing guide
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
