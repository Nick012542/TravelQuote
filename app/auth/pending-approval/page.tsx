import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PendingApprovalPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-sky-50 to-emerald-50 p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <MapPin className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-600 mb-2" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">TravelQuote Pro</h1>
        </div>

        <Card className="border-0 shadow-xl text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-amber-600" />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Pending Approval</CardTitle>
            <CardDescription>Your account is awaiting admin approval</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600 text-xs sm:text-sm">
              Thank you for registering! The admin has been notified and will review your account shortly. You will be
              able to access the system once your account is approved.
            </p>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full bg-transparent">
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
