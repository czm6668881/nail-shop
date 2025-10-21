import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { mkdir, writeFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { randomUUID } from "crypto"
import type { SupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { requireAdminUser } from "@/lib/auth/session"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/types/database"

export const runtime = "nodejs"

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"] as const
const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
}
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET ?? "product-images"
const USE_SUPABASE_STORAGE = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)

let bucketInitialized = false

const ensureSupabaseBucket = async (client: SupabaseClient<Database>) => {
  if (bucketInitialized) {
    return
  }

  const { data, error } = await client.storage.getBucket(BUCKET_NAME)
  if (error && error.statusCode !== 404) {
    throw error
  }

  if (!data) {
    const { error: createError } = await client.storage.createBucket(BUCKET_NAME, { public: true })
    if (createError && createError.statusCode !== 409) {
      throw createError
    }
  }

  bucketInitialized = true
}

const safeExtension = (file: File) => {
  const inferred = path.extname(file.name)
  if (inferred && inferred.length <= 8) {
    return inferred.toLowerCase()
  }
  return MIME_EXTENSION_MAP[file.type] ?? ""
}

const uploadToSupabase = async (file: File) => {
  const client = getSupabaseAdminClient()
  await ensureSupabaseBucket(client)

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const extension = safeExtension(file) || ".jpg"
  const filename = `product-${Date.now()}-${randomUUID()}${extension}`
  const objectPath = `products/${filename}`

  const { error } = await client.storage.from(BUCKET_NAME).upload(objectPath, buffer, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  })

  if (error) {
    throw new Error(`Supabase 图片上传失败: ${error.message}`)
  }

  const { data } = client.storage.from(BUCKET_NAME).getPublicUrl(objectPath)
  const publicUrl = data?.publicUrl

  if (!publicUrl) {
    throw new Error("无法生成图片访问链接")
  }

  return NextResponse.json({
    success: true,
    url: publicUrl,
    filename,
    size: file.size,
    type: file.type,
    storage: "supabase",
  })
}

const uploadToLocal = async (file: File) => {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const extension = safeExtension(file) || ".jpg"
  const filename = `product-${Date.now()}-${randomUUID()}${extension}`
  const uploadsDir = path.join(process.cwd(), "public", "uploads")

  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true })
  }

  const filepath = path.join(uploadsDir, filename)
  await writeFile(filepath, buffer)

  return NextResponse.json({
    success: true,
    url: `/uploads/${filename}`,
    filename,
    size: file.size,
    type: file.type,
    storage: "local",
  })
}

export async function POST(request: NextRequest) {
  try {
    try {
      await requireAdminUser(cookies())
    } catch {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "没有上传文件" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      return NextResponse.json(
        { error: "不支持的文件类型。请上传 JPG、PNG、GIF 或 WebP 格式的图片" },
        { status: 400 },
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "文件太大。最大支持 5MB" }, { status: 400 })
    }

    if (USE_SUPABASE_STORAGE) {
      return await uploadToSupabase(file)
    }

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error:
            "服务器未配置 Supabase 上传。请在环境变量中设置 NEXT_PUBLIC_SUPABASE_URL 与 SUPABASE_SERVICE_ROLE_KEY，并重新部署。",
        },
        { status: 500 },
      )
    }

    return await uploadToLocal(file)
  } catch (error) {
    console.error("图片上传失败:", error)
    return NextResponse.json({ error: "图片上传失败" }, { status: 500 })
  }
}
