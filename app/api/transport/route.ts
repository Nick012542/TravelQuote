import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const transport = await sql`
      SELECT t.*, d.name as destination_name
      FROM transport_prices t
      LEFT JOIN destinations d ON t.destination_id = d.id
      ORDER BY d.name, t.vehicle_type
    `
    return NextResponse.json(transport)
  } catch (error) {
    console.error("Error fetching transport:", error)
    return NextResponse.json({ error: "Failed to fetch transport" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { destination_id, vehicle_type, vehicle_name, capacity, price_per_day } = await request.json()

    const result = await sql`
      INSERT INTO transport_prices (destination_id, vehicle_type, vehicle_name, capacity, price_per_day)
      VALUES (${destination_id}, ${vehicle_type}, ${vehicle_name}, ${capacity || 4}, ${price_per_day})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating transport:", error)
    return NextResponse.json({ error: "Failed to create transport" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    await sql`DELETE FROM transport_prices WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting transport:", error)
    return NextResponse.json({ error: "Failed to delete transport" }, { status: 500 })
  }
}
