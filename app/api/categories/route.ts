"use server"

import { NextResponse } from "next/server"
import { listProductCategories } from "@/lib/db/queries"

export async function GET() {
  try {
    const categories = await listProductCategories()
    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Categories list error", error)
    return NextResponse.json({ message: "Unable to load categories." }, { status: 500 })
  }
}
