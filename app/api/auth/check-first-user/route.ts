import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("[v0] Checking for first user...")
    const result = await sql`SELECT COUNT(*) as count FROM users`
    console.log("[v0] Query result:", result)
    const count = Number.parseInt(result[0].count)
    return NextResponse.json({ isFirstUser: count === 0 })
  } catch (error: any) {
    console.error("[v0] Check first user error:", error?.message || error)
    // If table doesn't exist or any error, assume it's the first user
    return NextResponse.json({ isFirstUser: true })
  }
}
