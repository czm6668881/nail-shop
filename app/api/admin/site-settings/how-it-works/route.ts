import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { requireAdminUser } from "@/lib/auth/session"
import { deleteSiteSetting, getSiteSetting, upsertSiteSetting } from "@/lib/db/queries"

const WEAR_KEY = "how_it_works_wear_image"
const REMOVAL_KEY = "how_it_works_removal_image"

const ensureAdmin = async () => {
  await requireAdminUser(cookies())
}

export async function GET() {
  try {
    await ensureAdmin()
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const [wear, removal] = await Promise.all([
      getSiteSetting(WEAR_KEY),
      getSiteSetting(REMOVAL_KEY),
    ])

    return NextResponse.json({
      wearImage: wear?.value ?? null,
      removalImage: removal?.value ?? null,
    })
  } catch (error) {
    console.error("Admin how-it-works settings fetch error", error)
    return NextResponse.json({ message: "Unable to load settings." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await ensureAdmin()
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = (await request.json()) as {
      wearImage?: unknown
      removalImage?: unknown
    }

    const wearImage = typeof body.wearImage === "string" ? body.wearImage.trim() : undefined
    const removalImage = typeof body.removalImage === "string" ? body.removalImage.trim() : undefined

    if (wearImage !== undefined) {
      if (wearImage.length === 0) {
        await deleteSiteSetting(WEAR_KEY)
      } else {
        await upsertSiteSetting(WEAR_KEY, wearImage)
      }
    }

    if (removalImage !== undefined) {
      if (removalImage.length === 0) {
        await deleteSiteSetting(REMOVAL_KEY)
      } else {
        await upsertSiteSetting(REMOVAL_KEY, removalImage)
      }
    }

    const [wear, removal] = await Promise.all([
      getSiteSetting(WEAR_KEY),
      getSiteSetting(REMOVAL_KEY),
    ])

    return NextResponse.json({
      wearImage: wear?.value ?? null,
      removalImage: removal?.value ?? null,
    })
  } catch (error) {
    console.error("Admin how-it-works settings update error", error)
    return NextResponse.json({ message: "Unable to update settings." }, { status: 500 })
  }
}
