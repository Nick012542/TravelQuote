"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  LayoutDashboard,
  Hotel,
  Train,
  Car,
  Mountain,
  FileText,
  Calculator,
  LogOut,
  Menu,
  X,
  Users,
  Settings,
  Shield,
  ClipboardList,
} from "lucide-react"
import { useState } from "react"
import { signOutAction } from "@/app/actions/auth"

interface Profile {
  id: number
  email: string
  full_name: string
  role: "owner" | "salesperson"
  is_approved?: boolean
  is_primary_admin?: boolean
}

interface DashboardLayoutProps {
  children: React.ReactNode
  profile: Profile
}

export function DashboardLayout({ children, profile }: DashboardLayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await signOutAction()
  }

  const ownerLinks = [
    { href: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/owner/salespersons", label: "Salespersons", icon: Users },
    ...(profile.is_primary_admin ? [{ href: "/owner/admins", label: "Admins", icon: Shield }] : []),
    { href: "/owner/destinations", label: "Destinations", icon: Mountain },
    { href: "/owner/hotels", label: "Hotels", icon: Hotel },
    { href: "/owner/trains", label: "Train Prices", icon: Train },
    { href: "/owner/transport", label: "Transport", icon: Car },
    { href: "/owner/itineraries", label: "Itineraries", icon: ClipboardList },
    { href: "/owner/policies", label: "Policies", icon: Settings },
    { href: "/owner/quotes", label: "All Quotes", icon: FileText },
  ]

  const salesLinks = [
    { href: "/sales/quote", label: "Create Quote", icon: Calculator },
    { href: "/sales/my-quotes", label: "My Quotes", icon: FileText },
    { href: "/sales/itineraries", label: "Itineraries", icon: ClipboardList },
  ]

  const links = profile.role === "owner" ? ownerLinks : salesLinks

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="bg-white">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 sm:p-6 border-b">
            <Link href="/" className="flex items-center gap-2">
              <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
              <span className="text-lg sm:text-xl font-bold text-slate-800">TravelQuote</span>
            </Link>
          </div>

          <div className="p-3 sm:p-4 border-b bg-slate-50">
            <p className="text-xs sm:text-sm text-slate-600">Logged in as</p>
            <p className="font-medium text-slate-800 truncate text-sm sm:text-base">
              {profile.full_name || profile.email}
            </p>
            <span
              className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                profile.role === "owner" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {profile.role === "owner" ? (profile.is_primary_admin ? "Primary Admin" : "Admin") : "Salesperson"}
            </span>
          </div>

          <nav className="flex-1 p-2 sm:p-4 space-y-1 overflow-y-auto">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <link.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="p-3 sm:p-4 border-t">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 bg-transparent text-sm sm:text-base"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 pt-16 lg:pt-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
