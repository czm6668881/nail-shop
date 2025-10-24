import { NextResponse } from "next/server"
import { listCollections } from "@/lib/db/queries"

export async function GET() {
  try {
    const collections = await listCollections()
    return NextResponse.json(collections)
  } catch (error) {
    console.error("Failed to fetch collections:", error)
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 })
  }
}

