import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getHeroSlideById, updateHeroSlide, deleteHeroSlide } from "@/lib/api/hero-slides"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const slide = await getHeroSlideById(params.id)
    if (!slide) {
      return NextResponse.json({ error: "Hero slide not found" }, { status: 404 })
    }

    return NextResponse.json(slide)
  } catch (error) {
    console.error("Failed to fetch hero slide:", error)
    return NextResponse.json({ error: "Failed to fetch hero slide" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const slide = await updateHeroSlide(params.id, data)

    if (!slide) {
      return NextResponse.json({ error: "Hero slide not found" }, { status: 404 })
    }

    return NextResponse.json(slide)
  } catch (error) {
    console.error("Failed to update hero slide:", error)
    return NextResponse.json({ error: "Failed to update hero slide" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const success = await deleteHeroSlide(params.id)
    if (!success) {
      return NextResponse.json({ error: "Hero slide not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete hero slide:", error)
    return NextResponse.json({ error: "Failed to delete hero slide" }, { status: 500 })
  }
}

