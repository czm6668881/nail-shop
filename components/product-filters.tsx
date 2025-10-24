"use client"

import { useMemo, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { AVAILABILITY_FILTERS, PRICE_FILTERS, type CategoryFilterOption } from "@/lib/config/product-filters"

interface ProductFiltersProps {
  selectedCategories: string[]
  selectedPrices: string[]
  selectedAvailability: string[]
  categories: CategoryFilterOption[]
}

export function ProductFilters({
  selectedCategories,
  selectedPrices,
  selectedAvailability,
  categories,
}: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const params = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams])

  const updateMultiValueParam = (key: string, value: string, enable: boolean) => {
    const next = new URLSearchParams(params.toString())
    const existing = new Set(next.getAll(key))
    existing.delete(value)

    if (enable) {
      existing.add(value)
    }

    next.delete(key)
    Array.from(existing).forEach((item) => next.append(key, item))

    const query = next.toString()
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    })
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="font-semibold mb-4">Category</h3>
        {categories.length > 0 ? (
          <div className="space-y-3">
            {categories.map((category) => {
              const isChecked = selectedCategories.includes(category.id)
              return (
                <div key={category.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      updateMultiValueParam("category", category.id, checked === true)
                    }
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category.label}
                  </Label>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No categories available.</p>
        )}
      </div>

      <Separator />

      {/* Price Filter */}
      <div>
        <h3 className="font-semibold mb-4">Price Range</h3>
        <div className="space-y-3">
          {PRICE_FILTERS.map((range) => {
            const isChecked = selectedPrices.includes(range.id)
            return (
              <div key={range.id} className="flex items-center gap-2">
                <Checkbox
                  id={`price-${range.id}`}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    updateMultiValueParam("price", range.id, checked === true)
                  }
                />
                <Label htmlFor={`price-${range.id}`} className="text-sm font-normal cursor-pointer">
                  {range.label}
                </Label>
              </div>
            )
          })}
        </div>
      </div>

      <Separator />

      {/* Availability Filter */}
      <div>
        <h3 className="font-semibold mb-4">Availability</h3>
        <div className="space-y-3">
          {AVAILABILITY_FILTERS.map((option) => {
            const isChecked = selectedAvailability.includes(option.id)
            return (
              <div key={option.id} className="flex items-center gap-2">
                <Checkbox
                  id={`availability-${option.id}`}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    updateMultiValueParam("availability", option.id, checked === true)
                  }
                />
                <Label
                  htmlFor={`availability-${option.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
