"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer } from "lucide-react"
import Link from "next/link"

interface PDFGeneratorProps {
  quote: any
  policies: any
}

export function PDFGenerator({ quote, policies }: PDFGeneratorProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const itinerary = quote.itinerary_data?.itinerary || []
  const trainRouteInfo = quote.itinerary_data?.trainRoute

  const handlePrint = () => {
    window.print()
  }

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Get policies by type
  const includes = policies?.filter((p: any) => p.type === "include") || []
  const excludes = policies?.filter((p: any) => p.type === "exclude") || []
  const payments = policies?.filter((p: any) => p.type === "payment") || []
  const cancellations = policies?.filter((p: any) => p.type === "cancellation") || []

  // Calculate totals
  const totalNights = itinerary.reduce((sum: number, stop: any) => sum + (stop.nights || 0), 0)

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      "3-star-basic": "3★ Basic",
      "3-star-premium": "3★ Premium",
      "4-star": "4★",
      "5-star": "5★",
    }
    return labels[category] || category
  }

  const getTrainRouteDisplay = () => {
    if (!trainRouteInfo) return null
    if (typeof trainRouteInfo === "string") return null
    const route = trainRouteInfo.route || `${trainRouteInfo.from_city || ""}-${trainRouteInfo.to_city || ""}`
    return route !== "-" ? route : null
  }

  const trainRouteDisplay = getTrainRouteDisplay()

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Controls - Hidden when printing */}
      <div className="print:hidden bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href={`/sales/quote/${quote.id}`}>
            <Button variant="ghost" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quote
            </Button>
          </Link>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 flex-1 sm:flex-none">
              <Printer className="h-4 w-4 mr-2" />
              Print / Save PDF
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div className="container mx-auto px-4 py-8 print:p-0">
        <div ref={printRef} className="bg-white max-w-4xl mx-auto shadow-lg print:shadow-none print:max-w-none text-sm">
          {/* Header */}
          <div className="bg-emerald-700 text-white p-4 sm:p-6 print:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">TravelQuote Pro</h1>
                <p className="text-emerald-200 text-sm">Tour Itinerary</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-emerald-200 text-xs">Package Code</p>
                <p className="font-mono font-bold">{quote.package_code || quote.id.slice(0, 12).toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Traveller Details Section */}
          <div className="p-6 print:p-4 border-b">
            <h2 className="text-lg font-bold text-emerald-700 border-b-2 border-emerald-700 pb-1 mb-4">
              TRAVELLER DETAILS
            </h2>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Destination</p>
                <p className="font-semibold">{quote.destinations?.name}</p>
              </div>
              <div>
                <p className="text-slate-500">Arrival</p>
                <p className="font-semibold">{formatDate(quote.arrival_date)}</p>
              </div>
              <div>
                <p className="text-slate-500">No. of Adults</p>
                <p className="font-semibold">{quote.num_adults || quote.num_people}</p>
              </div>
              <div>
                <p className="text-slate-500">Customer Name</p>
                <p className="font-semibold">{quote.customer_name}</p>
              </div>
              <div>
                <p className="text-slate-500">Departure</p>
                <p className="font-semibold">{formatDate(quote.departure_date)}</p>
              </div>
              <div>
                <p className="text-slate-500">No. of Children</p>
                <p className="font-semibold">{quote.num_children || 0}</p>
              </div>
              <div>
                <p className="text-slate-500">Phone</p>
                <p className="font-semibold">{quote.customer_phone}</p>
              </div>
              <div>
                <p className="text-slate-500">Email</p>
                <p className="font-semibold">{quote.customer_email || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate-500">Package Code</p>
                <p className="font-semibold">{quote.package_code || quote.id.slice(0, 12).toUpperCase()}</p>
              </div>
              {(quote.extra_adult_count > 0 || quote.extra_child_count > 0) && (
                <>
                  <div>
                    <p className="text-slate-500">Extra Adults (with mattress)</p>
                    <p className="font-semibold">{quote.extra_adult_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Extra Children (without mattress)</p>
                    <p className="font-semibold">{quote.extra_child_count || 0}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Itinerary Section */}
          <div className="p-6 print:p-4 border-b">
            <h2 className="text-lg font-bold text-emerald-700 border-b-2 border-emerald-700 pb-1 mb-4">ITINERARY</h2>
            <p className="text-center font-bold text-lg mb-4 bg-emerald-50 py-2 rounded">
              {totalNights} NIGHTS {quote.total_days || totalNights + 1} DAYS
            </p>

            <div className="space-y-4">
              {itinerary.map((stop: any, index: number) => (
                <div key={index} className="border-l-4 border-emerald-600 pl-4">
                  <h3 className="font-bold text-emerald-700">
                    Day {index + 1}: {stop.placeName}
                  </h3>
                  <p className="text-slate-600 mt-1">
                    {stop.nights > 0
                      ? `Arrive and check-in to ${stop.hotelName || "selected hotel"}. Explore local attractions and enjoy the scenic beauty of ${stop.placeName}. ${stop.nights} night stay at ${stop.placeName}.`
                      : `Visit ${stop.placeName} for sightseeing and local experiences.`}
                  </p>
                  {stop.hotelName && (
                    <p className="text-sm text-slate-500 mt-1">
                      <span className="font-medium">Stay:</span> {stop.hotelName} (
                      {getCategoryLabel(stop.hotelCategory)})
                    </p>
                  )}
                </div>
              ))}

              {/* Final Day - Departure */}
              <div className="border-l-4 border-emerald-600 pl-4">
                <h3 className="font-bold text-emerald-700">Day {itinerary.length + 1}: Departure</h3>
                <p className="text-slate-600 mt-1">
                  After breakfast, check-out from the hotel and transfer to airport/railway station with wonderful
                  memories of your trip.
                </p>
              </div>
            </div>
          </div>

          {/* Package Includes */}
          <div className="p-6 print:p-4 border-b">
            <h2 className="text-lg font-bold text-emerald-700 border-b-2 border-emerald-700 pb-1 mb-4">
              PACKAGE INCLUDES
            </h2>
            <ul className="space-y-1">
              {includes.length > 0 ? (
                includes.map((item: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600">●</span>
                    <span>{item.description}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600">●</span>
                    <span>Daily breakfast + Lunch or dinner as per meal plan selected.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600">●</span>
                    <span>Accommodation on double / triple sharing basis at above mentioned hotels.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600">●</span>
                    <span>Exclusive a/c vehicle for pick up and drop as per the itinerary.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600">●</span>
                    <span>All sightseeing as per itinerary.</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Package Excludes */}
          <div className="p-6 print:p-4 border-b">
            <h2 className="text-lg font-bold text-emerald-700 border-b-2 border-emerald-700 pb-1 mb-4">
              PACKAGE EXCLUDES
            </h2>
            <ul className="space-y-1">
              {excludes.length > 0 ? (
                excludes.map((item: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-500">●</span>
                    <span>{item.description}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">●</span>
                    <span>Airfare / Train fare.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">●</span>
                    <span>All kind of personal expenses such as tips, laundry, telephone bills and beverages.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">●</span>
                    <span>Any meals not mentioned in the itinerary.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">●</span>
                    <span>Guide charges & entry tickets (if any).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">●</span>
                    <span>Optional activities and personal expenses.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">●</span>
                    <span>Camera fee (still or movie).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">●</span>
                    <span>Additional usage of vehicles.</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Hotels Table */}
          <div className="p-6 print:p-4 border-b">
            <h2 className="text-lg font-bold text-emerald-700 border-b-2 border-emerald-700 pb-1 mb-4">HOTELS</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-emerald-50">
                    <th className="border p-2 text-left">DESTINATION</th>
                    <th className="border p-2 text-left hidden sm:table-cell">CHECK IN</th>
                    <th className="border p-2 text-left hidden sm:table-cell">CHECK OUT</th>
                    <th className="border p-2 text-left">HOTEL & ROOM</th>
                    <th className="border p-2 text-center">NIGHTS</th>
                    <th className="border p-2 text-center hidden sm:table-cell">ROOMS</th>
                    <th className="border p-2 text-center">MEAL</th>
                  </tr>
                </thead>
                <tbody>
                  {itinerary
                    .filter((s: any) => s.hotelName)
                    .map((stop: any, idx: number) => (
                      <tr key={idx}>
                        <td className="border p-2">{stop.placeName}</td>
                        <td className="border p-2 hidden sm:table-cell">{formatDate(stop.checkInDate)}</td>
                        <td className="border p-2 hidden sm:table-cell">{formatDate(stop.checkOutDate)}</td>
                        <td className="border p-2">
                          <div className="font-medium">{stop.hotelName}</div>
                          <div className="text-slate-500">{getCategoryLabel(stop.hotelCategory)}</div>
                          <div className="text-slate-500">Room: {stop.roomType || "Deluxe"}</div>
                        </td>
                        <td className="border p-2 text-center">{stop.nights}</td>
                        <td className="border p-2 text-center hidden sm:table-cell">
                          {Math.ceil(quote.num_people / 2)}
                        </td>
                        <td className="border p-2 text-center">{stop.mealPlan || "MAP"}</td>
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-50 font-bold">
                    <td className="border p-2" colSpan={4}>
                      TOTAL
                    </td>
                    <td className="border p-2 text-center">{totalNights}</td>
                    <td className="border p-2 text-center hidden sm:table-cell">
                      {Math.ceil(quote.num_people / 2) * itinerary.filter((s: any) => s.hotelName).length}
                    </td>
                    <td className="border p-2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {quote.train_cost > 0 && trainRouteDisplay && (
            <div className="p-6 print:p-4 border-b">
              <h2 className="text-lg font-bold text-emerald-700 border-b-2 border-emerald-700 pb-1 mb-4">
                TRAIN DETAIL
              </h2>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-emerald-50">
                    <th className="border p-2 text-left">ROUTE</th>
                    <th className="border p-2 text-left">CLASS</th>
                    <th className="border p-2 text-center">PAX</th>
                    <th className="border p-2 text-right">COST</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">{trainRouteDisplay}</td>
                    <td className="border p-2 capitalize">{quote.train_class?.replace("ac", " AC") || "N/A"}</td>
                    <td className="border p-2 text-center">{quote.num_people} × 2 (Round Trip)</td>
                    <td className="border p-2 text-right">₹{quote.train_cost?.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Transport Details */}
          {quote.transport_type && (
            <div className="p-6 print:p-4 border-b">
              <h2 className="text-lg font-bold text-emerald-700 border-b-2 border-emerald-700 pb-1 mb-4">
                TRANSPORT DETAIL
              </h2>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-emerald-50">
                    <th className="border p-2 text-left">VEHICLE TYPE</th>
                    <th className="border p-2 text-left">DAYS</th>
                    <th className="border p-2 text-right">COST</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2 capitalize">{quote.transport_type?.replace("_", " ")}</td>
                    <td className="border p-2">{quote.total_days} Days</td>
                    <td className="border p-2 text-right">₹{quote.transport_cost?.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="p-6 print:p-4 border-b">
            <h2 className="text-lg font-bold text-emerald-700 border-b-2 border-emerald-700 pb-1 mb-4">PACKAGE RATE</h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-emerald-50">
                  <th className="border p-2 text-left">PARTICULAR</th>
                  <th className="border p-2 text-right hidden sm:table-cell">RATE PER HEAD</th>
                  <th className="border p-2 text-center">PAX</th>
                  <th className="border p-2 text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">Adult</td>
                  <td className="border p-2 text-right hidden sm:table-cell">
                    ₹{(quote.per_person_cost || 0).toLocaleString()}
                  </td>
                  <td className="border p-2 text-center">{quote.num_adults || quote.num_people}</td>
                  <td className="border p-2 text-right">
                    ₹{((quote.per_person_cost || 0) * (quote.num_adults || quote.num_people)).toLocaleString()}
                  </td>
                </tr>
                {quote.num_children > 0 && (
                  <tr>
                    <td className="border p-2">Child (70% of adult rate)</td>
                    <td className="border p-2 text-right hidden sm:table-cell">
                      ₹{Math.ceil((quote.per_person_cost || 0) * 0.7).toLocaleString()}
                    </td>
                    <td className="border p-2 text-center">{quote.num_children}</td>
                    <td className="border p-2 text-right">
                      ₹{(Math.ceil((quote.per_person_cost || 0) * 0.7) * quote.num_children).toLocaleString()}
                    </td>
                  </tr>
                )}
                {quote.extra_adult_count > 0 && (
                  <tr>
                    <td className="border p-2">Extra Adult (with mattress)</td>
                    <td className="border p-2 text-right hidden sm:table-cell">-</td>
                    <td className="border p-2 text-center">{quote.extra_adult_count}</td>
                    <td className="border p-2 text-right">₹{(quote.extra_adult_cost || 0).toLocaleString()}</td>
                  </tr>
                )}
                {quote.extra_child_count > 0 && (
                  <tr>
                    <td className="border p-2">Extra Child (without mattress)</td>
                    <td className="border p-2 text-right hidden sm:table-cell">-</td>
                    <td className="border p-2 text-center">{quote.extra_child_count}</td>
                    <td className="border p-2 text-right">₹{(quote.extra_child_cost || 0).toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-emerald-600 text-white font-bold">
                  <td className="border p-3" colSpan={3}>
                    TOTAL PACKAGE AMOUNT
                  </td>
                  <td className="border p-3 text-right text-lg">
                    ₹{(quote.final_cost || quote.total_cost || 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Policy */}
          <div className="p-6 print:p-4 border-b">
            <h2 className="text-lg font-bold text-emerald-700 border-b-2 border-emerald-700 pb-1 mb-4">
              PAYMENT POLICY
            </h2>
            <ul className="space-y-1">
              {payments.length > 0 ? (
                payments.map((item: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600">{idx + 1}.</span>
                    <span>{item.description}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600">1.</span>
                    <span>50% of the package amount at the time of booking.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600">2.</span>
                    <span>Balance amount 03 days before check-in.</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Cancellation Policy */}
          <div className="p-6 print:p-4">
            <h2 className="text-lg font-bold text-emerald-700 border-b-2 border-emerald-700 pb-1 mb-4">
              CANCELLATION POLICY
            </h2>
            <ul className="space-y-1">
              {cancellations.length > 0 ? (
                cancellations.map((item: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-500">●</span>
                    <span>{item.description}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">●</span>
                    <span>Booking Cancelled on or before 30 days of arrival: Nil cancellation.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">●</span>
                    <span>Booking Cancelled between 30 to 15 days of arrival: 50% retention & 50% refund.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">●</span>
                    <span>Booking Cancelled on or within 15 days of arrival: Nil refund.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">●</span>
                    <span>Any booking for peak season (15 Dec to 15 Jan): Nil refund.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">●</span>
                    <span>No refund will be made for unused room nights.</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Footer */}
          <div className="bg-emerald-700 text-white p-4 text-center text-xs">
            <p>Thank you for choosing TravelQuote Pro!</p>
            <p className="text-emerald-200 mt-1">For any queries, please contact us.</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:p-4 {
            padding: 1rem !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
        }
      `}</style>
    </div>
  )
}
