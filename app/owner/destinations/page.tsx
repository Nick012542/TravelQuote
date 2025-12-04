import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DestinationsManager } from "@/components/owner/destinations-manager"

export default async function DestinationsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "owner") {
    redirect("/sales/quote")
  }

  // Fetch destinations
  const destinations = await sql`SELECT * FROM destinations ORDER BY name`

  // Fetch places for each destination
  const places = await sql`SELECT * FROM places ORDER BY name`

  // Group places by destination
  const destinationsWithPlaces = destinations.map((d: any) => ({
    ...d,
    places: places.filter((p: any) => p.destination_id === d.id),
  }))

  const profile = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  }

  return (
    <DashboardLayout profile={profile}>
      <DestinationsManager destinations={destinationsWithPlaces || []} />
    </DashboardLayout>
  )
}
