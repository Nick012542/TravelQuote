import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const trains = await sql`
      SELECT * FROM train_prices ORDER BY from_city, to_city
    `
    return NextResponse.json(trains)
  } catch (error) {
    console.error("Error fetching trains:", error)
    return NextResponse.json({ error: "Failed to fetch trains" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { from_city, to_city, class: trainClass, price_per_person } = await request.json()

    const result = await sql`
      INSERT INTO train_prices (from_city, to_city, class, price_per_person)
      VALUES (${from_city}, ${to_city}, ${trainClass}, ${price_per_person})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating train:", error)
    return NextResponse.json({ error: "Failed to create train" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    await sql`DELETE FROM train_prices WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting train:", error)
    return NextResponse.json({ error: "Failed to delete train" }, { status: 500 })
  }
}
