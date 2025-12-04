import { neon } from "@neondatabase/serverless"

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!connectionString) {
  console.error(
    "[v0] Database connection string not found. Available env vars:",
    Object.keys(process.env).filter((k) => k.includes("NEON") || k.includes("POSTGRES") || k.includes("DATABASE")),
  )
}

export const sql = neon(connectionString!)

// Helper function to execute queries
export async function query<T = any>(queryString: string, params: any[] = []): Promise<T[]> {
  try {
    const result = await sql(queryString, params)
    return result as T[]
  } catch (error) {
    console.error("[v0] Database query error:", error)
    throw error
  }
}
