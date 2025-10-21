"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Edit, Plus, Upload } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { HeroSlide } from "@/types"
import Image from "next/image"

export default function HeroSlidesAdminPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    image: "",
    active: true,
  })

  useEffect(() => {
    fetchSlides()
  }, [])

  const fetchSlides = async () => {
    try {
      const res = await fetch("/api/admin/hero-slides")
      if (!res.ok) throw new Error("Failed to fetch slides")
      const data = await res.json()
      setSlides(data)
    } catch (error) {
      console.error("Failed to fetch hero slides", error)
      toast({
        title: "错误",
        description: "无法加载轮播图数据",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")
      const { url } = await res.json()

      setFormData((prev) => ({ ...prev, image: url }))
      toast({
        title: "成功",
        description: "图片上传成功",
      })
    } catch (error) {
      console.error("Failed to upload hero slide image", error)
      toast({
        title: "错误",
        description: "图片上传失败",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.image) {
      toast({
        title: "错误",
        description: "图片为必填项",
        variant: "destructive",
      })
      return
    }

    try {
      const url = editingSlide
        ? `/api/admin/hero-slides/${editingSlide.id}`
        : "/api/admin/hero-slides"

      const res = await fetch(url, {
        method: editingSlide ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "gelmanicure",
          subtitle: "Discover our collection of premium press-on nails. Easy to apply, stunning results, and reusable for multiple wears.",
          image: formData.image,
          buttonText: "Shop Now",
          buttonLink: "/products",
          active: formData.active,
          orderIndex: editingSlide ? editingSlide.orderIndex : slides.length,
        }),
      })

      if (!res.ok) throw new Error("Failed to save slide")

      toast({
        title: "成功",
        description: editingSlide ? "轮播图已更新" : "轮播图已创建",
      })

      setDialogOpen(false)
      resetForm()
      fetchSlides()
    } catch (error) {
      console.error("Failed to save hero slide", error)
      toast({
        title: "错误",
        description: "保存失败",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide)
    setFormData({
      image: slide.image,
      active: slide.active,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个轮播图吗？")) return

    try {
      const res = await fetch(`/api/admin/hero-slides/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete slide")

      toast({
        title: "成功",
        description: "轮播图已删除",
      })

      fetchSlides()
    } catch (error) {
      console.error("Failed to delete hero slide", error)
      toast({
        title: "错误",
        description: "删除失败",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      const res = await fetch(`/api/admin/hero-slides/${slide.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !slide.active }),
      })

      if (!res.ok) throw new Error("Failed to toggle active")

      fetchSlides()
    } catch (error) {
      console.error("Failed to update hero slide status", error)
      toast({
        title: "错误",
        description: "更新状态失败",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setEditingSlide(null)
    setFormData({
      image: "",
      active: true,
    })
  }

  const handleOpenDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">首页轮播管理</h1>
          <p className="text-muted-foreground mt-2">管理首页的轮播图片和内容</p>
        </div>
        <Button onClick={handleOpenDialog}>
          <Plus className="mr-2 h-4 w-4" />
          添加轮播图
        </Button>
      </div>

      <div className="grid gap-4">
        {slides.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              暂无轮播图，点击上方按钮添加
            </CardContent>
          </Card>
        ) : (
          slides.map((slide) => (
            <Card key={slide.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="relative w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src={slide.image}
                      alt="幻灯片图片"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">幻灯片图片</h3>
                        <p className="text-muted-foreground mt-1 text-sm">
                          标题固定为 &quot;gelmanicure&quot;
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={slide.active}
                          onCheckedChange={() => handleToggleActive(slide)}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(slide)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(slide.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSlide ? "编辑轮播图" : "添加轮播图"}</DialogTitle>
            <DialogDescription>
              {editingSlide ? "更新轮播图信息" : "创建新的轮播图"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>标题（固定）</Label>
                <div className="px-3 py-2 bg-muted rounded-md text-muted-foreground">
                  gelmanicure
                </div>
                <p className="text-sm text-muted-foreground">
                  标题固定为 &quot;gelmanicure&quot;，不可修改
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">轮播图片 *</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, image: e.target.value }))
                    }
                    placeholder="图片URL"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("file-upload")?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "上传中..." : "上传"}
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadImage}
                  />
                </div>
                {formData.image && (
                  <div className="relative w-full h-48 mt-2 rounded-lg overflow-hidden">
                    <Image
                      src={formData.image}
                      alt="预览"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, active: checked }))
                  }
                />
                <Label htmlFor="active">启用</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                取消
              </Button>
              <Button type="submit">
                {editingSlide ? "更新" : "创建"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

