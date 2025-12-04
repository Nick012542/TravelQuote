import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { QuoteBuilder } from "@/components/sales/quote-builder"

export default async function SalesQuotePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all data needed for quote builder
  const destinations = await sql`SELECT * FROM destinations ORDER BY name`
  const places = await sql`SELECT * FROM places ORDER BY name`
  const hotels =
    await sql`SELECT h.*, p.name as place_name, p.destination_id FROM hotels h LEFT JOIN places p ON h.place_id = p.id`
  const trainPrices = await sql`SELECT * FROM train_prices`
  const transportPrices = await sql`SELECT * FROM transport_prices`

  // Transform destinations with places
  const destinationsWithPlaces = destinations.map((d: any) => ({
    ...d,
    places: places.filter((p: any) => p.destination_id === d.id),
  }))

  // Transform hotels
  const transformedHotels = hotels.map((h: any) => ({
    ...h,
    places: { name: h.place_name, destination_id: h.destination_id },
  }))

  const profile = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  }

  return (
    <DashboardLayout profile={profile}>
      <QuoteBuilder
        destinations={destinationsWithPlaces || []}
        hotels={transformedHotels || []}
        trainPrices={trainPrices || []}
        transportPrices={transportPrices || []}
        userId={user.id}
      />
    </DashboardLayout>
  )
}
