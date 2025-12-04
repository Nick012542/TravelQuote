"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, User, Phone, Mail, Calendar, Users, Train, Car, Hotel, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface QuoteDetailsProps {
  quote: any
}

export function QuoteDetails({ quote }: QuoteDetailsProps) {
  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  }

  const itinerary = quote.itinerary_data?.itinerary || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/sales/my-quotes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Quote Details</h1>
            <p className="text-slate-600 mt-1">Created on {new Date(quote.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={statusColors[quote.status]}>{quote.status}</Badge>
          <Link href={`/sales/quote/${quote.id}/pdf`}>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-600" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Name</p>
                  <p className="font-medium">{quote.customer_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="font-medium">{quote.customer_phone}</p>
                </div>
              </div>
              {quote.customer_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium">{quote.customer_email}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trip Info */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                Trip Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Destination</p>
                  <p className="font-medium">{quote.destinations?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">People</p>
                  <p className="font-medium">{quote.num_people}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Duration</p>
                  <p className="font-medium">{quote.total_days} Days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Itinerary */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="h-5 w-5 text-rose-600" />
                Itinerary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {itinerary.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No itinerary data</p>
              ) : (
                <div className="space-y-4">
                  {itinerary.map((stop: any, index: number) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800">{stop.placeName}</h4>
                        <p className="text-sm text-slate-600">
                          {stop.days} Day{stop.days > 1 ? "s" : ""} / {stop.nights} Night{stop.nights > 1 ? "s" : ""}
                        </p>
                        {stop.hotelName && (
                          <p className="text-sm text-slate-500 mt-1">
                            <Hotel className="h-3 w-3 inline mr-1" />
                            {stop.hotelName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cost Summary */}
        <div>
          <Card className="border-0 shadow-md sticky top-6">
            <CardHeader className="bg-emerald-600 text-white rounded-t-lg">
              <CardTitle>Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Train className="h-4 w-4" />
                    Train
                  </span>
                  <span className="font-medium">₹{quote.train_cost?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Transport
                  </span>
                  <span className="font-medium">₹{quote.transport_cost?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Hotel className="h-4 w-4" />
                    Hotels
                  </span>
                  <span className="font-medium">₹{quote.hotel_cost?.toLocaleString() || 0}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-600">Total Cost</span>
                  <span className="text-2xl font-bold text-slate-800">₹{quote.total_cost?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Per Person</span>
                  <span className="text-lg font-semibold text-emerald-600">
                    ₹{quote.per_person_cost?.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
