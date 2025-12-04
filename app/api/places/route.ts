import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const places = await sql`
      SELECT p.*, d.name as destination_name 
      FROM places p
      LEFT JOIN destinations d ON p.destination_id = d.id
      ORDER BY p.name
    `
    return NextResponse.json(places)
  } catch (error) {
    console.error("Error fetching places:", error)
    return NextResponse.json({ error: "Failed to fetch places" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { destination_id, name, description } = await request.json()

    const result = await sql`
      INSERT INTO places (destination_id, name, description)
      VALUES (${destination_id}, ${name}, ${description})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating place:", error)
    return NextResponse.json({ error: "Failed to create place" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    await sql`DELETE FROM places WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting place:", error)
    return NextResponse.json({ error: "Failed to delete place" }, { status: 500 })
  }
}
