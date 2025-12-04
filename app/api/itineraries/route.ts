import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const itineraries = await sql`SELECT * FROM itinerary_templates ORDER BY created_at DESC`
    return NextResponse.json(itineraries)
  } catch (error) {
    console.error("Error fetching itineraries:", error)
    return NextResponse.json({ error: "Failed to fetch itineraries" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { destination_id, name, description, days, content } = body

    const result = await sql`
      INSERT INTO itinerary_templates (destination_id, name, description, days, content)
      VALUES (${destination_id}, ${name}, ${description || ""}, ${days}, ${content || ""})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating itinerary:", error)
    return NextResponse.json({ error: "Failed to create itinerary" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, destination_id, name, description, days, content } = body

    const result = await sql`
      UPDATE itinerary_templates 
      SET destination_id = ${destination_id}, 
          name = ${name}, 
          description = ${description || ""}, 
          days = ${days}, 
          content = ${content || ""}
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating itinerary:", error)
    return NextResponse.json({ error: "Failed to update itinerary" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    await sql`DELETE FROM itinerary_templates WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting itinerary:", error)
    return NextResponse.json({ error: "Failed to delete itinerary" }, { status: 500 })
  }
}
