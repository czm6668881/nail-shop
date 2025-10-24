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
  // When the bucket is missing, getBucket returns no data and no error
  if (!data && !error) {
    // Create the bucket when it does not exist yet
    const { error: createError } = await client.storage.createBucket(BUCKET_NAME, { public: true })
    // Only throw if creation fails for reasons other than "already exists" (e.g., a race condition)
    if (createError && !createError.message.includes("already exists")) {
      throw new Error(`Failed to create storage bucket: ${createError.message}`)
    }
  } else if (error && !error.message.includes("not found") && !error.message.includes("does not exist")) {
    // For any other error (not a missing bucket), rethrow
    throw new Error(`Failed to retrieve storage bucket: ${error.message}`)
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
    throw new Error(`Supabase image upload failed: ${error.message}`)
  }

  const { data } = client.storage.from(BUCKET_NAME).getPublicUrl(objectPath)
  const publicUrl = data?.publicUrl

  if (!publicUrl) {
    throw new Error("Unable to generate a public image URL")
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      return NextResponse.json(
        { error: "Unsupported file type. Upload JPG, PNG, GIF, or WebP images." },
        { status: 400 },
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File is too large. Maximum size is 5MB." }, { status: 400 })
    }

    if (USE_SUPABASE_STORAGE) {
      return await uploadToSupabase(file)
    }

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          error:
            "Supabase storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then redeploy.",
        },
        { status: 500 },
      )
    }

    return await uploadToLocal(file)
  } catch (error) {
    console.error("Image upload failed:", error)
    return NextResponse.json({ error: "Image upload failed" }, { status: 500 })
  }
}
