import { NextResponse, type NextRequest } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { getAllHeroSlides, createHeroSlide, reorderHeroSlides } from "@/lib/api/hero-slides"
import { revalidateHeroSlideCache } from "@/lib/cache"

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const slides = await getAllHeroSlides()
    return NextResponse.json(slides)
  } catch (error) {
    console.error("Failed to fetch hero slides:", error)
    return NextResponse.json({ error: "Failed to fetch hero slides" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    if (!data.title || !data.image) {
      return NextResponse.json({ error: "Title and image are required" }, { status: 400 })
    }

    const slide = await createHeroSlide({
      title: data.title,
      subtitle: data.subtitle,
      image: data.image,
      buttonText: data.buttonText,
      buttonLink: data.buttonLink,
      orderIndex: data.orderIndex,
      active: data.active ?? true,
    })

    revalidateHeroSlideCache()

    return NextResponse.json(slide, { status: 201 })
  } catch (error) {
    console.error("Failed to create hero slide:", error)
    return NextResponse.json({ error: "Failed to create hero slide" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slideIds } = await request.json()

    if (!Array.isArray(slideIds)) {
      return NextResponse.json({ error: "slideIds must be an array" }, { status: 400 })
    }

    await reorderHeroSlides(slideIds)

    revalidateHeroSlideCache()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to reorder hero slides:", error)
    return NextResponse.json({ error: "Failed to reorder hero slides" }, { status: 500 })
  }
}

