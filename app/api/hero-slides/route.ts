import { NextResponse } from "next/server"
import { getActiveHeroSlides } from "@/lib/api/hero-slides"

export async function GET() {
  try {
    const slides = await getActiveHeroSlides()
    return NextResponse.json(slides)
  } catch (error) {
    console.error("Failed to fetch active hero slides:", error)
    return NextResponse.json({ error: "Failed to fetch hero slides" }, { status: 500 })
  }
}

