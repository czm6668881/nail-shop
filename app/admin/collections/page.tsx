"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react"
import type { Collection } from "@/types"

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchCollections = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/collections")
      if (!response.ok) {
        throw new Error("Unable to load collections.")
      }
      const data = await response.json()
      setCollections(data.collections)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load collections.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  const filteredCollections = useMemo(
    () =>
      collections.filter((collection) =>
        collection.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [collections, searchQuery],
  )

  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      const response = await fetch(`/api/admin/collections/${id}/feature`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured }),
      })
      if (!response.ok) {
        throw new Error("Unable to update collection.")
      }
      setCollections((prev) => prev.map((collection) => (collection.id === id ? { ...collection, featured } : collection)))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to update collection.")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return
    try {
      const response = await fetch(`/api/admin/collections/${id}`, { method: "DELETE" })
      if (!response.ok) {
        throw new Error("Unable to delete collection.")
      }
      setCollections((prev) => prev.filter((collection) => collection.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to delete collection.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Collections</h1>
          <p className="text-muted-foreground">Manage product collections</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Collection
        </Button>
      </div>

      {error && <div className="text-destructive">{error}</div>}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search collections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          disabled={loading}
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCollections.map((collection) => (
              <TableRow key={collection.id}>
                <TableCell>
                  <div className="relative h-12 w-12 rounded overflow-hidden">
                    <Image
                      src={collection.image || "/placeholder.svg"}
                      alt={collection.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{collection.name}</TableCell>
                <TableCell className="max-w-xs truncate">{collection.description}</TableCell>
                <TableCell>{collection.productCount}</TableCell>
                <TableCell>
                  <Badge
                    variant={collection.featured ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleFeatured(collection.id, !collection.featured)}
                  >
                    {collection.featured ? "Featured" : "Not Featured"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <a href={`/collections/${collection.slug}`} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(collection.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Loading collections...
                </TableCell>
              </TableRow>
            )}
            {!loading && filteredCollections.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No collections found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredCollections.length} of {collections.length} collections
      </div>
    </div>
  )
}
