import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TransportManager } from "@/components/owner/transport-manager"

export default async function TransportPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "owner") {
    redirect("/sales/quote")
  }

  // Fetch transport prices with destination info
  const transportPrices = await sql`
    SELECT t.*, d.name as destination_name
    FROM transport_prices t
    LEFT JOIN destinations d ON t.destination_id = d.id
    ORDER BY t.vehicle_type
  `

  const destinations = await sql`SELECT * FROM destinations ORDER BY name`

  // Transform to expected format
  const transformedPrices = transportPrices.map((t: any) => ({
    ...t,
    destinations: { name: t.destination_name },
  }))

  const profile = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  }

  return (
    <DashboardLayout profile={profile}>
      <TransportManager transportPrices={transformedPrices || []} destinations={destinations || []} />
    </DashboardLayout>
  )
}
