import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { HotelsManager } from "@/components/owner/hotels-manager"

export default async function HotelsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "owner") {
    redirect("/sales/quote")
  }

  // Fetch hotels with place and destination info
  const hotels = await sql`
    SELECT h.*, p.name as place_name, d.name as destination_name
    FROM hotels h
    LEFT JOIN places p ON h.place_id = p.id
    LEFT JOIN destinations d ON p.destination_id = d.id
    ORDER BY h.name
  `

  // Fetch places with destination info
  const places = await sql`
    SELECT p.*, d.name as destination_name
    FROM places p
    LEFT JOIN destinations d ON p.destination_id = d.id
    ORDER BY p.name
  `

  // Transform data to match expected format
  const transformedHotels = hotels.map((h: any) => ({
    ...h,
    places: { name: h.place_name, destinations: { name: h.destination_name } },
  }))

  const transformedPlaces = places.map((p: any) => ({
    ...p,
    destinations: { name: p.destination_name },
  }))

  const profile = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  }

  return (
    <DashboardLayout profile={profile}>
      <HotelsManager hotels={transformedHotels || []} places={transformedPlaces || []} />
    </DashboardLayout>
  )
}
