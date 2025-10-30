"use client"

import { useMemo, useState } from "react"
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
  const [selectedLength, setSelectedLength] = useState<number | null>(() => {
    const initialLengths = normalizeLengthValues(product.sizeLengths?.[initialSize])
    return initialLengths[0] ?? null
  })
  const addItem = useCartStore((state) => state.addItem)
  const loading = useCartStore((state) => state.loading)

  const availableLengths = useMemo(() => normalizeLengthValues(product.sizeLengths?.[selectedSize]), [product.sizeLengths, selectedSize])

  const handleSizeChange = (value: string) => {
    const nextSize = value as NailSize
    setSelectedSize(nextSize)
    const nextLengths = normalizeLengthValues(product.sizeLengths?.[nextSize])
    setSelectedLength(nextLengths[0] ?? null)
  }

  const handleAddToCart = async () => {
    setError(null)
    if (availableLengths.length > 0 && selectedLength === null) {
      setError("Please select a length option before adding to cart.")
      return
    }
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
        <RadioGroup value={selectedSize} onValueChange={handleSizeChange}>
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
        {availableLengths.length > 0 && (
          <div className="mt-4 space-y-2">
            <Label className="text-sm font-semibold block">Select Length</Label>
            <RadioGroup
              value={selectedLength !== null ? selectedLength.toString() : ""}
              onValueChange={(value) => setSelectedLength(Number(value))}
            >
              <div className="flex flex-wrap gap-3">
                {availableLengths.map((length) => {
                  const value = formatLength(length)
                  const id = `${selectedSize}-${value}`
                  return (
                    <div key={id}>
                      <RadioGroupItem value={length.toString()} id={id} className="peer sr-only" />
                      <Label
                        htmlFor={id}
                        className="flex h-10 px-4 cursor-pointer items-center justify-center rounded-md border-2 border-muted bg-background hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground transition-colors"
                      >
                        {value} cm
                      </Label>
                    </div>
                  )
                })}
              </div>
            </RadioGroup>
          </div>
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
