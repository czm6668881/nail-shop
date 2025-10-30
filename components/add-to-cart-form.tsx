"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCartStore } from "@/lib/store/cart-store"
import type { Product, NailSize } from "@/types"
import { normalizeLengthValues } from "@/lib/utils/lengths"
import { ShoppingBag, Check } from "lucide-react"

interface AddToCartFormProps {
  product: Product
}

export function AddToCartForm({ product }: AddToCartFormProps) {
  const initialSize = (product.sizes && product.sizes.length > 0 ? product.sizes[0] : "M") as NailSize
  const [selectedSize, setSelectedSize] = useState<NailSize>(initialSize)
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const addItem = useCartStore((state) => state.addItem)
  const loading = useCartStore((state) => state.loading)

  const rawLengths = product.sizeLengths?.[selectedSize]
  const selectedLengths = normalizeLengthValues(rawLengths)

  const handleAddToCart = async () => {
    setError(null)
    try {
      await addItem(product, selectedSize, quantity)
      setIsAdded(true)
      setTimeout(() => setIsAdded(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add to cart.")
    }
  }

  const formatLength = (value: number) => Number(value.toFixed(2)).toString()

  return (
    <div className="space-y-6">
      {/* Size Selection */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Select Size</Label>
        <RadioGroup value={selectedSize} onValueChange={(value) => setSelectedSize(value as NailSize)}>
          <div className="flex gap-3">
            {product.sizes.map((size) => (
              <div key={size}>
                <RadioGroupItem value={size} id={size} className="peer sr-only" />
                <Label
                  htmlFor={size}
                  className="flex h-10 w-14 cursor-pointer items-center justify-center rounded-md border-2 border-muted bg-background hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-colors"
                >
                  {size}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
        {selectedLengths.length > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            Length{selectedLengths.length > 1 ? "s" : ""}: {selectedLengths.map(formatLength).join(" / ")} cm
          </p>
        )}
      </div>

      {/* Quantity */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Quantity</Label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            -
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.min(10, quantity + 1))}
            disabled={quantity >= 10}
          >
            +
          </Button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={!product.inStock || loading}>
        {isAdded ? (
          <>
            <Check className="mr-2 h-5 w-5" />
            Added to Cart
          </>
        ) : (
          <>
            <ShoppingBag className="mr-2 h-5 w-5" />
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </>
        )}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
