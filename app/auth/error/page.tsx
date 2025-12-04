import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin, AlertCircle } from "lucide-react"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-sky-50 to-emerald-50 p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <MapPin className="h-12 w-12 text-emerald-600 mb-2" />
          <h1 className="text-2xl font-bold text-slate-800">TravelQuote Pro</h1>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Something Went Wrong</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-600 mb-6">{params?.error || "An unspecified error occurred."}</p>
            <Link href="/auth/login">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Try Again</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
