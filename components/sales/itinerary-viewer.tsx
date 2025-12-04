"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Eye, Calendar, MapPin, Copy, Check, File, Download } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import type { Destination } from "@/lib/types"

interface Itinerary {
  id: number
  destination_id: number
  name: string
  description: string
  days: number
  content: string
  file_url?: string
  file_type?: string
  created_at: string
}

interface ItineraryViewerProps {
  itineraries: Itinerary[]
  destinations: Destination[]
}

export function ItineraryViewer({ itineraries, destinations }: ItineraryViewerProps) {
  const [viewingItinerary, setViewingItinerary] = useState<Itinerary | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [destinationFilter, setDestinationFilter] = useState<string>("all")
  const [copied, setCopied] = useState(false)

  const filteredItineraries = itineraries.filter((it) => {
    const dest = destinations.find((d) => d.id === it.destination_id)
    const matchesSearch =
      it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest?.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDestination = destinationFilter === "all" || String(it.destination_id) === destinationFilter
    return matchesSearch && matchesDestination
  })

  const getDestinationName = (destId: number) => {
    return destinations.find((d) => d.id === destId)?.name || "Unknown"
  }

  const handleCopyItinerary = async (content: string) => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isPDFItinerary = (itinerary: Itinerary) => {
    return itinerary.file_url && itinerary.file_type === "application/pdf"
  }

  const handleDownloadPDF = (itinerary: Itinerary) => {
    if (itinerary.file_url) {
      const link = document.createElement("a")
      link.href = itinerary.file_url
      link.download = `${itinerary.name}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Itineraries</h1>
        <p className="text-slate-600 mt-1">View and use pre-made itineraries for quotes</p>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Search itineraries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery("")}
              />
            </div>
            <Select value={destinationFilter} onValueChange={setDestinationFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {destinations.map((dest) => (
                  <SelectItem key={dest.id} value={String(dest.id)}>
                    {dest.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredItineraries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">
              {searchQuery || destinationFilter !== "all"
                ? "No itineraries match your search"
                : "No itineraries available yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItineraries.map((itinerary) => (
            <Card key={itinerary.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-2">
                  <div className={`p-2 rounded-lg ${isPDFItinerary(itinerary) ? "bg-red-100" : "bg-emerald-100"}`}>
                    {isPDFItinerary(itinerary) ? (
                      <File className="h-4 w-4 text-red-600" />
                    ) : (
                      <FileText className="h-4 w-4 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base line-clamp-2">{itinerary.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {getDestinationName(itinerary.destination_id)}
                  </span>
                  {!isPDFItinerary(itinerary) && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {itinerary.days} Days
                    </span>
                  )}
                </div>
                {isPDFItinerary(itinerary) && (
                  <div className="flex items-center gap-2 text-sm text-red-600 mb-3">
                    <File className="h-4 w-4" />
                    <span>PDF Document</span>
                  </div>
                )}
                {itinerary.description && (
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">{itinerary.description}</p>
                )}
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => setViewingItinerary(itinerary)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Itinerary
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Itinerary Dialog - Updated for PDF */}
      <Dialog open={!!viewingItinerary} onOpenChange={() => setViewingItinerary(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingItinerary?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {viewingItinerary && getDestinationName(viewingItinerary.destination_id)}
                </span>
                {viewingItinerary && !isPDFItinerary(viewingItinerary) && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {viewingItinerary.days} Days
                  </span>
                )}
              </div>
              {viewingItinerary && isPDFItinerary(viewingItinerary) ? (
                <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(viewingItinerary)}>
                  <Download className="h-4 w-4 mr-1" />
                  Download PDF
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewingItinerary && handleCopyItinerary(viewingItinerary.content)}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              )}
            </div>
            {viewingItinerary?.description && <p className="text-slate-600">{viewingItinerary.description}</p>}
            <div className="border-t pt-4">
              {viewingItinerary && isPDFItinerary(viewingItinerary) ? (
                <div>
                  <h4 className="font-medium mb-2">PDF Itinerary</h4>
                  <iframe
                    src={viewingItinerary.file_url}
                    className="w-full h-[600px] border rounded-lg"
                    title={viewingItinerary.name}
                  />
                </div>
              ) : (
                <div>
                  <h4 className="font-medium mb-2">Full Itinerary</h4>
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 p-4 rounded-lg font-sans">
                    {viewingItinerary?.content}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
