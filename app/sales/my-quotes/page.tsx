import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { QuotesList } from "@/components/quotes-list"

export default async function MyQuotesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch quotes for this user
  const quotes = await sql`
    SELECT q.*, d.name as destination_name
    FROM quotes q
    LEFT JOIN destinations d ON q.destination_id = d.id
    WHERE q.salesperson_id = ${user.id}
    ORDER BY q.created_at DESC
  `

  // Transform to expected format
  const transformedQuotes = quotes.map((q: any) => ({
    ...q,
    destinations: { name: q.destination_name },
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">My Quotes</h1>
          <p className="text-slate-600 mt-1">View and manage your quotes</p>
        </div>
        <QuotesList quotes={transformedQuotes || []} title="All Quotes" />
      </div>
    </DashboardLayout>
  )
}
