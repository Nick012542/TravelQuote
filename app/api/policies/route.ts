import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const policies = await sql`SELECT * FROM package_policies ORDER BY type, order_index`
    return NextResponse.json(policies)
  } catch (error) {
    console.error("Error fetching policies:", error)
    return NextResponse.json({ error: "Failed to fetch policies" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { type, description, order_index, is_default } = await request.json()

    const result = await sql`
      INSERT INTO package_policies (type, description, order_index, is_default)
      VALUES (${type}, ${description}, ${order_index}, ${is_default})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error adding policy:", error)
    return NextResponse.json({ error: "Failed to add policy" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Policy ID required" }, { status: 400 })
    }

    await sql`DELETE FROM package_policies WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting policy:", error)
    return NextResponse.json({ error: "Failed to delete policy" }, { status: 500 })
  }
}
