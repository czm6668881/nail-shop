"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Edit, GripVertical, Plus, Upload } from "lucide-react"
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
    title: "",
    subtitle: "",
    image: "",
    buttonText: "",
    buttonLink: "",
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

    if (!formData.title || !formData.image) {
      toast({
        title: "错误",
        description: "标题和图片为必填项",
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
          ...formData,
          orderIndex: slides.length,
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
      title: slide.title,
      subtitle: slide.subtitle || "",
      image: slide.image,
      buttonText: slide.buttonText || "",
      buttonLink: slide.buttonLink || "",
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
      title: "",
      subtitle: "",
      image: "",
      buttonText: "",
      buttonLink: "",
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
                  <div className="flex items-center">
                    <GripVertical className="h-6 w-6 text-muted-foreground cursor-move" />
                  </div>
                  <div className="relative w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{slide.title}</h3>
                        {slide.subtitle && (
                          <p className="text-muted-foreground mt-1">{slide.subtitle}</p>
                        )}
                        {slide.buttonText && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium">按钮: </span>
                            <span>{slide.buttonText}</span>
                            {slide.buttonLink && (
                              <span className="text-muted-foreground"> → {slide.buttonLink}</span>
                            )}
                          </div>
                        )}
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
                <Label htmlFor="title">标题 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subtitle">副标题</Label>
                <Textarea
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
                  }
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">图片 *</Label>
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
              <div className="grid gap-2">
                <Label htmlFor="buttonText">按钮文本</Label>
                <Input
                  id="buttonText"
                  value={formData.buttonText}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, buttonText: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="buttonLink">按钮链接</Label>
                <Input
                  id="buttonLink"
                  value={formData.buttonLink}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, buttonLink: e.target.value }))
                  }
                  placeholder="/products"
                />
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

