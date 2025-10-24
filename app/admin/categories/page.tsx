
"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, RefreshCcw, Search } from "lucide-react"
import type { ProductCategory } from "@/types"
import { sortProductCategories } from "@/lib/utils/categories"
import { slugify } from "@/lib/utils/slug"

type CategoryFormMode = "create" | "edit"

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<CategoryFormMode>("create")
  const [slugDirty, setSlugDirty] = useState(false)
  const [formState, setFormState] = useState({
    id: "",
    name: "",
    slug: "",
    description: "",
    sortOrder: "",
    submitting: false,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/categories")
      if (!response.ok) {
        throw new Error("Unable to load categories.")
      }
      const data = await response.json()
      setCategories(sortProductCategories(data.categories ?? []))
      setError(null)
    } catch (error) {
      console.error(error)
      setError(error instanceof Error ? error.message : "Unable to load categories.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const filteredCategories = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    if (!normalized) {
      return categories
    }
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(normalized) ||
        category.slug.toLowerCase().includes(normalized),
    )
  }, [categories, searchQuery])

  const openCreateDialog = () => {
    setDialogMode("create")
    setFormState({
      id: "",
      name: "",
      slug: "",
      description: "",
      sortOrder: "",
      submitting: false,
    })
    setSlugDirty(false)
    setDialogOpen(true)
  }

  const openEditDialog = (category: ProductCategory) => {
    setDialogMode("edit")
    setFormState({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      sortOrder: typeof category.sortOrder === "number" ? String(category.sortOrder) : "",
      submitting: false,
    })
    setSlugDirty(true)
    setDialogOpen(true)
  }

  const resetFormState = () => {
    setFormState({
      id: "",
      name: "",
      slug: "",
      description: "",
      sortOrder: "",
      submitting: false,
    })
    setSlugDirty(false)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      resetFormState()
    }
  }

  const handleNameChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      name: value,
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormState((prev) => ({ ...prev, submitting: true }))

    try {
      const payload: Record<string, unknown> = {
        name: formState.name.trim(),
        slug: formState.slug.trim(),
      }

      if (!payload.name) {
        toast.error("Category name is required")
        return
      }

      if (!payload.slug) {
        toast.error("Category slug is required")
        return
      }

      if (formState.description.trim().length > 0) {
        payload.description = formState.description.trim()
      }

      if (formState.sortOrder.trim().length > 0) {
        const parsed = Number(formState.sortOrder)
        if (Number.isNaN(parsed)) {
          toast.error("Sort order must be a number")
          return
        }
        payload.sortOrder = parsed
      }

      const url =
        dialogMode === "create"
          ? "/api/admin/categories"
          : `/api/admin/categories/${formState.id}`

      const response = await fetch(url, {
        method: dialogMode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const message = await response.json().catch(() => ({}))
        throw new Error(message?.message ?? "Operation failed. Please try again later.")
      }

      const data = await response.json()
      if (!data?.category) {
        throw new Error("Server returned invalid data.")
      }

      setCategories((prev) =>
        sortProductCategories(
          dialogMode === "create"
            ? [...prev, data.category]
            : prev.map((category) => (category.id === data.category.id ? data.category : category)),
        ),
      )

      toast.success(dialogMode === "create" ? "Category created." : "Category updated.")
      setDialogOpen(false)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Operation failed. Please try again later.")
    } finally {
      setFormState((prev) => ({ ...prev, submitting: false }))
    }
  }

  const confirmDelete = (category: ProductCategory) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!categoryToDelete) return
    try {
      const response = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const message = await response.json().catch(() => ({}))
        throw new Error(message?.message ?? "Failed to delete category.")
      }

      setCategories((prev) => prev.filter((category) => category.id !== categoryToDelete.id))
      toast.success("Category deleted.")
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Failed to delete category.")
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await fetchCategories()
      toast.success("Category list refreshed.")
    } catch (error) {
      console.error("Refresh categories failed", error)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Categories</h1>
          <p className="text-muted-foreground">Keep storefront categories in sync with the admin data.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading || refreshing}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : "opacity-0"}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add category
          </Button>
        </div>
      </div>

      {error && <div className="text-destructive text-sm">{error}</div>}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories by name or slug..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="pl-9"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px]">Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[120px] text-right">Sort</TableHead>
              <TableHead className="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{category.slug}</Badge>
                </TableCell>
                <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                  {category.description ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  {typeof category.sortOrder === "number" ? category.sortOrder : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(category)}
                      title="Edit category"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(category)}
                      title="Delete category"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  Loading categories...
                </TableCell>
              </TableRow>
            )}
            {!loading && filteredCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No matching categories
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredCategories.length} of {categories.length} categories
      </p>

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "create" ? "Add category" : "Edit category"}</DialogTitle>
            <DialogDescription>
              The slug powers storefront filters and navigation links; keep it aligned with your product settings.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category name</Label>
              <Input
                id="category-name"
                value={formState.name}
                onChange={(event) => handleNameChange(event.target.value)}
                placeholder="Example: Classic"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-slug">Category slug</Label>
              <Input
                id="category-slug"
                value={formState.slug}
                onChange={(event) => handleSlugChange(event.target.value)}
                placeholder="Example: classic"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Category description (optional)</Label>
              <Input
                id="category-description"
                value={formState.description}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Use for admin notes or additional storefront copy."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-sort">Sort order (number, lower values appear first, optional)</Label>
              <Input
                id="category-sort"
                type="number"
                value={formState.sortOrder}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, sortOrder: event.target.value }))
                }
                placeholder="Example: 1"
                min={0}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogOpenChange(false)}
                disabled={formState.submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formState.submitting}>
                {formState.submitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm category deletion</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToDelete
                ? `This action cannot be undone and will affect navigation linked to this category. Slug: ${categoryToDelete.slug}`
                : "Are you sure you want to delete this category?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}




