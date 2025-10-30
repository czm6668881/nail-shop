"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Upload, ImageIcon, Trash2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface HowItWorksSettings {
  wearImage: string | null
  removalImage: string | null
}

const MAX_SIZE_MB = 5
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]

async function uploadFile(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Unsupported file format. Use JPG, PNG, GIF, SVG, or WebP.")
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`)
  }

  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(typeof data.error === "string" ? data.error : "Image upload failed")
  }

  const json = (await response.json()) as { url: string }
  return json.url
}

export default function AdminHowItWorksPage() {
  const [settings, setSettings] = useState<HowItWorksSettings>({ wearImage: null, removalImage: null })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [wearUploading, setWearUploading] = useState(false)
  const [removalUploading, setRemovalUploading] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/admin/site-settings/how-it-works")
        if (!response.ok) {
          throw new Error("Unable to load settings")
        }
        const data = (await response.json()) as HowItWorksSettings
        setSettings(data)
      } catch (error) {
        console.error(error)
        toast.error(error instanceof Error ? error.message : "Unable to load settings")
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleUpload = async (file: File, field: "wearImage" | "removalImage") => {
    try {
      if (field === "wearImage") {
        setWearUploading(true)
      } else {
        setRemovalUploading(true)
      }
      const url = await uploadFile(file)
      setSettings((prev) => ({ ...prev, [field]: url }))
      toast.success("Image uploaded")
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Upload failed")
    } finally {
      if (field === "wearImage") {
        setWearUploading(false)
      } else {
        setRemovalUploading(false)
      }
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/site-settings/how-it-works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(typeof data.message === "string" ? data.message : "Unable to save settings")
      }

      const data = (await response.json()) as HowItWorksSettings
      setSettings(data)
      toast.success("How It Works visuals updated")
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Unable to save settings")
    } finally {
      setSaving(false)
    }
  }

  const renderUploader = (
    label: string,
    field: "wearImage" | "removalImage",
    uploading: boolean,
    helper: string,
  ) => {
    const value = settings[field]

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>{label}</Label>
            <p className="text-xs text-muted-foreground">{helper}</p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={uploading}
              onClick={() => {
                const input = document.createElement("input")
                input.type = "file"
                input.accept = "image/*"
                input.onchange = (event) => {
                  const file = (event.target as HTMLInputElement).files?.[0]
                  if (file) {
                    void handleUpload(file, field)
                  }
                }
                input.click()
              }}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading…" : "Upload"}
            </Button>
            {value && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setSettings((prev) => ({ ...prev, [field]: null }))}
              >
                <Trash2 className="mr-2 h-4 w-4" />Clear
              </Button>
            )}
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card/90 p-4">
          {value ? (
            <Image src={value} alt={`${label} preview`} width={720} height={420} className="w-full h-auto object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
              <ImageIcon className="h-10 w-10" />
              <p className="text-sm">No image selected. Upload a PNG, JPG, GIF, SVG, or WebP.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading How It Works settings…</p>
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">How It Works Visuals</h1>
        <p className="text-muted-foreground">
          Upload or replace the imagery used on the public How It Works page. Changes publish immediately after saving.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {renderUploader("Wear method graphic", "wearImage", wearUploading, "Displayed in the application walk-through section.")}
        {renderUploader("Removal method graphic", "removalImage", removalUploading, "Displayed in the removal instructions section.")}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving…" : "Save changes"}
        </Button>
        <Input readOnly value="Images are stored under /uploads and can be replaced at any time." className="max-w-xl" />
      </div>
    </div>
  )
}
