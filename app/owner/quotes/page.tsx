import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { QuotesList } from "@/components/quotes-list"

export default async function OwnerQuotesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "owner") {
    redirect("/sales/quote")
  }

  // Fetch quotes with destination and salesperson info
  const quotes = await sql`
    SELECT q.*, d.name as destination_name, u.full_name as salesperson_name, u.email as salesperson_email
    FROM quotes q
    LEFT JOIN destinations d ON q.destination_id = d.id
    LEFT JOIN users u ON q.salesperson_id = u.id
    ORDER BY q.created_at DESC
  `

  // Transform to expected format
  const transformedQuotes = quotes.map((q: any) => ({
    ...q,
    destinations: { name: q.destination_name },
    profiles: { full_name: q.salesperson_name, email: q.salesperson_email },
  }))

  const profile = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">All Quotes</h1>
          <p className="text-slate-600 mt-1">View all quotes created by salespersons</p>
        </div>
        <QuotesList quotes={transformedQuotes || []} showSalesperson />
      </div>
    </DashboardLayout>
  )
}
