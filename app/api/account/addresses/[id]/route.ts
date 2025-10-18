import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { deleteAddressForUser, listAddressesByUser, setDefaultAddressForUser } from "@/lib/db/queries"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const payload = await request.json()
    if (!payload || !payload.isDefault) {
      return NextResponse.json({ message: "No updates supplied." }, { status: 400 })
    }

    await setDefaultAddressForUser(user.id, id)
    const addresses = await listAddressesByUser(user.id)
    return NextResponse.json({ addresses })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to update address." },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    await deleteAddressForUser(user.id, id)
    const addresses = await listAddressesByUser(user.id)
    return NextResponse.json({ addresses })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to delete address." },
      { status: 500 },
    )
  }
}
