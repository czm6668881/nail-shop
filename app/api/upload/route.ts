import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json(
        { error: "没有上传文件" },
        { status: 400 }
      )
    }

    // 验证文件类型
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "不支持的文件类型。请上传 JPG、PNG、GIF 或 WebP 格式的图片" },
        { status: 400 }
      )
    }

    // 验证文件大小 (最大 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "文件太大。最大支持 5MB" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 生成唯一文件名
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = path.extname(file.name)
    const filename = `product-${timestamp}-${randomString}${extension}`

    // 确保 uploads 目录存在
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // 保存文件
    const filepath = path.join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    // 返回可访问的 URL
    const url = `/uploads/${filename}`

    return NextResponse.json({
      success: true,
      url,
      filename,
      size: file.size,
      type: file.type
    })
  } catch (error) {
    console.error("图片上传失败:", error)
    return NextResponse.json(
      { error: "图片上传失败" },
      { status: 500 }
    )
  }
}


