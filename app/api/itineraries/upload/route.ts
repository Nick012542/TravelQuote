import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const name = formData.get("name") as string
    const destinationId = formData.get("destination_id") as string
    const description = formData.get("description") as string

    if (!file || !name || !destinationId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Convert file to base64 for storage
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const fileData = `data:${file.type};base64,${base64}`

    // Store in database with file data
    const result = await sql`
      INSERT INTO itinerary_templates (destination_id, name, description, days, content, file_url, file_type)
      VALUES (${destinationId}, ${name}, ${description || ""}, 0, '', ${fileData}, ${file.type})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error uploading itinerary:", error)
    return NextResponse.json({ error: "Failed to upload itinerary" }, { status: 500 })
  }
}
