"use server"

import { NextResponse } from "next/server"
import { listProductCategories } from "@/lib/db/queries"
import { fallbackProductCategories } from "@/lib/data/categories"

export async function GET() {
  try {
    const categories = await listProductCategories()
    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Categories list error", error)
    console.warn("Falling back to default categories due to load failure.")
    return NextResponse.json({ categories: fallbackProductCategories, fallback: true })
  }
}
