import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const hotels = await sql`
      SELECT h.*, p.name as place_name, d.name as destination_name
      FROM hotels h
      LEFT JOIN places p ON h.place_id = p.id
      LEFT JOIN destinations d ON p.destination_id = d.id
      ORDER BY h.name
    `
    return NextResponse.json(hotels)
  } catch (error) {
    console.error("Error fetching hotels:", error)
    return NextResponse.json({ error: "Failed to fetch hotels" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const {
      place_id,
      name,
      category,
      room_type,
      price_per_night,
      price_ep,
      price_cp,
      price_map,
      price_ap,
      extra_adult_with_mattress,
      extra_child_without_mattress,
    } = await request.json()

    const result = await sql`
      INSERT INTO hotels (
        place_id, name, category, room_type, price_per_night, 
        price_ep, price_cp, price_map, price_ap,
        extra_adult_with_mattress, extra_child_without_mattress
      )
      VALUES (
        ${place_id}, ${name}, ${category}, ${room_type || "Deluxe Room"}, ${price_per_night || price_map || 0}, 
        ${price_ep || 0}, ${price_cp || 0}, ${price_map || 0}, ${price_ap || 0},
        ${extra_adult_with_mattress || 0}, ${extra_child_without_mattress || 0}
      )
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating hotel:", error)
    return NextResponse.json({ error: "Failed to create hotel" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    await sql`DELETE FROM hotels WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting hotel:", error)
    return NextResponse.json({ error: "Failed to delete hotel" }, { status: 500 })
  }
}
