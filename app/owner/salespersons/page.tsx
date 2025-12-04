import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { SalespersonManagement } from "@/components/owner/salesperson-management"

export default async function SalespersonsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "owner") {
    redirect("/sales/quote")
  }

  // Fetch all salespersons using Neon
  const salespersons = await sql`
    SELECT id, email, full_name, role, is_approved, is_primary_admin, created_at 
    FROM users 
    WHERE role = 'salesperson' 
    ORDER BY created_at DESC
  `

  return (
    <DashboardLayout profile={user}>
      <SalespersonManagement salespersons={salespersons || []} />
    </DashboardLayout>
  )
}
