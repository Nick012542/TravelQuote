import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Users, Calculator, FileText } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
            <span className="text-lg sm:text-2xl font-bold text-slate-800">TravelQuote Pro</span>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="sm:size-default bg-transparent">
                Login
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm" className="sm:size-default bg-emerald-600 hover:bg-emerald-700">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:py-16">
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-3 sm:mb-4 text-balance">
            Tours & Travels Management System
          </h1>
          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto text-pretty">
            Create instant tour quotes, manage pricing, and generate professional itineraries for your customers
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-16">
          <Card className="border-0 shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <MapPin className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-600 mb-2" />
              <CardTitle className="text-lg sm:text-xl">Destinations</CardTitle>
              <CardDescription className="text-sm">
                Manage multiple destinations like Himachal, Kashmir, Uttarakhand
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <Calculator className="h-8 w-8 sm:h-10 sm:w-10 text-sky-600 mb-2" />
              <CardTitle className="text-lg sm:text-xl">Live Pricing</CardTitle>
              <CardDescription className="text-sm">
                Real-time cost calculation for hotels, transport & trains
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <Users className="h-8 w-8 sm:h-10 sm:w-10 text-amber-600 mb-2" />
              <CardTitle className="text-lg sm:text-xl">Team Access</CardTitle>
              <CardDescription className="text-sm">Separate access for admins and salespersons</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-rose-600 mb-2" />
              <CardTitle className="text-lg sm:text-xl">PDF Itinerary</CardTitle>
              <CardDescription className="text-sm">Download professional itineraries for customers</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <Link href="/auth/sign-up">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6"
            >
              Get Started Now
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t bg-white/80 backdrop-blur-sm mt-8 sm:mt-16">
        <div className="container mx-auto px-4 py-4 sm:py-6 text-center text-slate-600 text-sm sm:text-base">
          <p>TravelQuote Pro - Professional Tour Management System</p>
        </div>
      </footer>
    </div>
  )
}
