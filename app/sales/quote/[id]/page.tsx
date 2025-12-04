import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { QuoteDetails } from "@/components/sales/quote-details"

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  const { data: quote } = await supabase.from("quotes").select("*, destinations(name)").eq("id", id).single()

  if (!quote) {
    redirect("/sales/my-quotes")
  }

  return (
    <DashboardLayout profile={profile}>
      <QuoteDetails quote={quote} />
    </DashboardLayout>
  )
}
