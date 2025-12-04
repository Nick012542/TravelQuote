import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ItineraryViewer } from "@/components/sales/itinerary-viewer"

export default async function SalesItinerariesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch itineraries and destinations
  const itineraries = await sql`SELECT * FROM itinerary_templates ORDER BY created_at DESC`
  const destinations = await sql`SELECT * FROM destinations ORDER BY name`

  const profile = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    is_approved: user.is_approved,
    is_primary_admin: user.is_primary_admin,
  }

  return (
    <DashboardLayout profile={profile}>
      <ItineraryViewer itineraries={itineraries || []} destinations={destinations || []} />
    </DashboardLayout>
  )
}
