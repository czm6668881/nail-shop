"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Save, X, ImageIcon, Upload, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import type { Product } from "@/types"

const CATEGORIES = [
  "Press-On Nails",
  "Nail Care",
  "Nail Art",
  "Tools & Accessories",
] as const

const NAIL_SIZES = ["XS", "S", "M", "L", "XL"]

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const isNew = productId === "new"

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    category: "Press-On Nails" as Product["category"],
    collection: "",
    inStock: true,
    stockQuantity: "0",
    slug: "",
    application: "",
    featured: false,
    images: [] as string[],
    sizes: [] as string[],
    features: [] as string[],
    featureInput: "",
    materials: [] as string[],
    materialInput: "",
  })

  const loadProduct = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`)
      if (!response.ok) {
        throw new Error("Failed to load product")
      }
      const data = await response.json()
      const product = data.product as Product
      
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        compareAtPrice: product.compareAtPrice?.toString() || "",
        category: product.category,
        collection: product.collection || "",
        inStock: product.inStock,
        stockQuantity: product.stockQuantity.toString(),
        slug: product.slug,
        application: product.application || "",
        featured: product.featured,
        images: product.images,
        sizes: product.sizes,
        features: product.features,
        featureInput: "",
        materials: product.materials,
        materialInput: "",
      })
    } catch (error) {
      console.error("Failed to load product", error)
      toast.error("Failed to load product")
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    if (!isNew) {
      loadProduct()
    }
  }, [isNew, loadProduct])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        category: formData.category,
        collection: formData.collection || undefined,
        inStock: formData.inStock,
        stockQuantity: parseInt(formData.stockQuantity),
        slug: formData.slug,
        application: formData.application,
        featured: formData.featured,
        images: formData.images,
        sizes: formData.sizes,
        features: formData.features,
        materials: formData.materials,
      }

      const url = isNew ? "/api/admin/products" : `/api/admin/products/${productId}`
      const method = isNew ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        throw new Error("Failed to save product")
      }

      toast.success(isNew ? "Product created successfully" : "Product updated successfully")
      router.push("/admin/products")
    } catch (error) {
      console.error("Failed to save product", error)
      toast.error("Failed to save product")
    } finally {
      setSaving(false)
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 验证文件类型
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("不支持的文件格式。请上传 JPG、PNG、GIF 或 WebP 格式的图片")
      return
    }

    // 验证文件大小 (最大 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("文件太大。最大支持 5MB")
      return
    }

    const loadingToast = toast.loading("正在上传图片...")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "上传失败")
      }

      const data = await response.json()
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, data.url],
      }))

      toast.dismiss(loadingToast)
      toast.success("图片上传成功")

      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error("上传失败:", error)
      toast.error(error instanceof Error ? error.message : "图片上传失败")
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    })
  }

  const toggleSize = (size: string) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.includes(size)
        ? formData.sizes.filter((s) => s !== size)
        : [...formData.sizes, size],
    })
  }

  const addFeature = () => {
    if (formData.featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, formData.featureInput.trim()],
        featureInput: "",
      })
      toast.success("特性已添加")
    } else {
      toast.error("请输入特性内容")
    }
  }

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    })
  }

  const addMaterial = () => {
    if (formData.materialInput.trim()) {
      setFormData({
        ...formData,
        materials: [...formData.materials, formData.materialInput.trim()],
        materialInput: "",
      })
      toast.success("材料已添加")
    } else {
      toast.error("请输入材料内容")
    }
  }

  const removeMaterial = (index: number) => {
    setFormData({
      ...formData,
      materials: formData.materials.filter((_, i) => i !== index),
    })
  }

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
    setFormData({ ...formData, slug })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
        <h1 className="text-4xl font-bold">{isNew ? "Create Product" : "Edit Product"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug *</Label>
            <div className="flex gap-2">
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
              <Button type="button" variant="outline" onClick={generateSlug}>
                Generate
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="compareAtPrice">Compare at Price ($)</Label>
              <Input
                id="compareAtPrice"
                type="number"
                step="0.01"
                value={formData.compareAtPrice}
                onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as Product["category"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="stockQuantity">Stock Quantity *</Label>
              <Input
                id="stockQuantity"
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="collection">Collection</Label>
            <Input
              id="collection"
              value={formData.collection}
              onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="application">Application Instructions</Label>
            <Textarea
              id="application"
              value={formData.application}
              onChange={(e) => setFormData({ ...formData, application: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label>Sizes *</Label>
            <div className="flex gap-2 mt-2">
              {NAIL_SIZES.map((size) => (
                <Button
                  key={size}
                  type="button"
                  variant={formData.sizes.includes(size) ? "default" : "outline"}
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label>产品图片</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              点击下方按钮上传本地图片，支持 JPG、PNG、GIF、WebP 格式，最大 5MB
            </p>
            <div className="mt-3 space-y-4">
              {/* 文件上传区域 */}
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={handleFileSelect}
                  disabled={uploading}
                  variant="default"
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "上传中..." : "上传图片"}
                </Button>
              </div>

              {/* Image preview grid */}
              {formData.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((img, index) => (
                    <div key={index} className="group relative">
                      <div 
                        className="aspect-square rounded-lg border-2 border-border overflow-hidden bg-muted cursor-pointer"
                        onDoubleClick={() => {
                          setPreviewImage(img)
                          setIsPreviewOpen(true)
                        }}
                      >
                        <Image
                          src={img || "/placeholder.svg"}
                          alt={`Product image ${index + 1}`}
                          width={300}
                          height={300}
                          className="object-cover w-full h-full"
                          unoptimized={img.startsWith('http')}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg"
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                        <div className="flex flex-col items-center gap-2 pointer-events-auto">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            删除
                          </Button>
                          <span className="text-xs text-white px-2 py-1 bg-black/50 rounded pointer-events-none">
                            图片 {index + 1} (双击查看大图)
                          </span>
                        </div>
                      </div>
                      {/* Image URL input */}
                      <div className="mt-2">
                        <Input
                          value={img}
                          onChange={(e) => {
                            const newImages = [...formData.images]
                            newImages[index] = e.target.value
                            setFormData({ ...formData, images: newImages })
                          }}
                          className="text-xs"
                          placeholder="Image URL"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground font-medium">暂无图片</p>
                  <p className="text-sm text-muted-foreground mt-1">点击上方“上传图片”按钮添加产品图片</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="featureInput">产品特性</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              添加产品的主要特性和优点
            </p>
            <div className="flex gap-2 mb-2">
              <Input
                id="featureInput"
                placeholder="输入特性内容，然后点击添加"
                value={formData.featureInput}
                onChange={(e) => setFormData({ ...formData, featureInput: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addFeature()
                  }
                }}
                className="flex-1"
              />
              <Button type="button" onClick={addFeature} className="shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                添加
              </Button>
            </div>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input value={feature} readOnly />
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeFeature(index)}>
                    <X className="h-4 w-4 mr-1" />
                    删除
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="materialInput">产品材料</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              添加产品的主要材料成分
            </p>
            <div className="flex gap-2 mb-2">
              <Input
                id="materialInput"
                placeholder="输入材料内容，然后点击添加"
                value={formData.materialInput}
                onChange={(e) => setFormData({ ...formData, materialInput: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addMaterial()
                  }
                }}
                className="flex-1"
              />
              <Button type="button" onClick={addMaterial} className="shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                添加
              </Button>
            </div>
            <div className="space-y-2">
              {formData.materials.map((material, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input value={material} readOnly />
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeMaterial(index)}>
                    <X className="h-4 w-4 mr-1" />
                    删除
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="inStock"
                checked={formData.inStock}
                onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
              />
              <Label htmlFor="inStock">In Stock</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
              <Label htmlFor="featured">Featured</Label>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Product"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
            Cancel
          </Button>
        </div>
      </form>

      {/* Image Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>图片预览</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            {previewImage && (
              <div className="relative w-full">
                <Image
                  src={previewImage}
                  alt="Preview"
                  width={1200}
                  height={1200}
                  className="w-full h-auto object-contain max-h-[70vh]"
                  unoptimized={previewImage.startsWith('http')}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg"
                  }}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
