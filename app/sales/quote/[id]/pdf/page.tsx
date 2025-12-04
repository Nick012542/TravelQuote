import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PDFGenerator } from "@/components/sales/pdf-generator"

export default async function PDFPage({
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

  const { data: quote } = await supabase.from("quotes").select("*, destinations(name)").eq("id", id).single()

  if (!quote) {
    redirect("/sales/my-quotes")
  }

  const { data: policies } = await supabase
    .from("package_policies")
    .select("*")
    .or(`destination_id.eq.${quote.destination_id},is_default.eq.true`)
    .order("order_index")

  return <PDFGenerator quote={quote} policies={policies || []} />
}
