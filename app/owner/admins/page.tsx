import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AdminManagement } from "@/components/owner/admin-management"

export default async function AdminsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "owner" || !user.is_primary_admin) {
    redirect("/owner/dashboard")
  }

  // Fetch all admin users using Neon
  const admins = await sql`
    SELECT id, email, full_name, role, is_approved, is_primary_admin, created_at 
    FROM users 
    WHERE role = 'owner' 
    ORDER BY created_at ASC
  `

  return (
    <DashboardLayout profile={user}>
      <AdminManagement admins={admins || []} currentUserEmail={user.email} isPrimaryAdmin={user.is_primary_admin} />
    </DashboardLayout>
  )
}
