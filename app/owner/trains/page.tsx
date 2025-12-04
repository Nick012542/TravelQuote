import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TrainsManager } from "@/components/owner/trains-manager"

export default async function TrainsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "owner") {
    redirect("/sales/quote")
  }

  const trainPrices = await sql`SELECT * FROM train_prices ORDER BY from_city, to_city`

  const profile = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  }

  return (
    <DashboardLayout profile={profile}>
      <TrainsManager trainPrices={trainPrices || []} />
    </DashboardLayout>
  )
}
