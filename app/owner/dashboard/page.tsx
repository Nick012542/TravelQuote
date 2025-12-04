import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Hotel, Train, Car, FileText, Clock, CheckCircle } from "lucide-react"

export default async function OwnerDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role !== "owner") {
    redirect("/sales/quote")
  }

  // Fetch counts using Neon
  const [destinations, hotels, trains, transport, quotes, pendingSales, approvedSales] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM destinations`,
    sql`SELECT COUNT(*) as count FROM hotels`,
    sql`SELECT COUNT(*) as count FROM train_prices`,
    sql`SELECT COUNT(*) as count FROM transport_prices`,
    sql`SELECT COUNT(*) as count FROM quotes`,
    sql`SELECT COUNT(*) as count FROM users WHERE role = 'salesperson' AND is_approved = FALSE`,
    sql`SELECT COUNT(*) as count FROM users WHERE role = 'salesperson' AND is_approved = TRUE`,
  ])

  const stats = [
    {
      label: "Destinations",
      value: Number.parseInt(destinations[0]?.count || 0),
      icon: MapPin,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      label: "Hotels",
      value: Number.parseInt(hotels[0]?.count || 0),
      icon: Hotel,
      color: "text-sky-600",
      bg: "bg-sky-100",
    },
    {
      label: "Train Routes",
      value: Number.parseInt(trains[0]?.count || 0),
      icon: Train,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      label: "Transport",
      value: Number.parseInt(transport[0]?.count || 0),
      icon: Car,
      color: "text-rose-600",
      bg: "bg-rose-100",
    },
    {
      label: "Total Quotes",
      value: Number.parseInt(quotes[0]?.count || 0),
      icon: FileText,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ]

  const pendingCount = Number.parseInt(pendingSales[0]?.count || 0)
  const approvedCount = Number.parseInt(approvedSales[0]?.count || 0)

  const salesStats = [
    { label: "Pending Approval", value: pendingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
    {
      label: "Active Salespersons",
      value: approvedCount,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
  ]

  return (
    <DashboardLayout profile={user}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage your tours and pricing</p>
        </div>

        {pendingCount > 0 && (
          <Card className="border-0 shadow-md bg-amber-50 border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Clock className="h-8 w-8 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-800">{pendingCount} salesperson(s) awaiting approval</p>
                  <p className="text-sm text-amber-700">Go to Salespersons page to review and approve new accounts.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid sm:grid-cols-2 gap-6">
          {salesStats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{stat.label}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{stat.label}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Quick Start Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-800 mb-2">1. Approve Salespersons</h3>
                <p className="text-sm text-slate-600">
                  Review and approve new salesperson registrations from the Salespersons page.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-800 mb-2">2. Add Destinations</h3>
                <p className="text-sm text-slate-600">
                  Add destinations like Himachal, Kashmir, etc. Then add places within each destination.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-800 mb-2">3. Set Hotel Prices</h3>
                <p className="text-sm text-slate-600">
                  Add hotels for each place with category (3-star, 4-star, 5-star) and per-night pricing.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-800 mb-2">4. Configure Policies</h3>
                <p className="text-sm text-slate-600">
                  Set up package includes, excludes, payment and cancellation policies for PDF.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
