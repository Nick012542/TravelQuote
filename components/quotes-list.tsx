"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Eye } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import Link from "next/link"

interface Quote {
  id: string
  customer_name: string
  customer_phone: string
  destinations: { name: string }
  profiles?: { full_name: string; email: string }
  num_people: number
  total_days: number
  total_cost: number
  final_cost?: number
  per_person_cost: number
  status: string
  created_at: string
}

interface QuotesListProps {
  quotes: Quote[]
  showSalesperson?: boolean
  title?: string
}

export function QuotesList({ quotes, showSalesperson = false, title = "Quotes" }: QuotesListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customer_phone.includes(searchQuery) ||
      quote.destinations?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="space-y-4">
        <CardTitle>{title}</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder={
                showSalesperson
                  ? "Search by customer, phone, destination, salesperson..."
                  : "Search by customer, phone, destination..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery("")}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        {filteredQuotes.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">
              {searchQuery || statusFilter !== "all" ? "No quotes match your search criteria" : "No quotes yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden sm:table-cell">Destination</TableHead>
                  {showSalesperson && <TableHead className="hidden md:table-cell">Salesperson</TableHead>}
                  <TableHead className="hidden lg:table-cell">People</TableHead>
                  <TableHead className="hidden lg:table-cell">Days</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Per Person</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{quote.customer_name}</p>
                        <p className="text-xs text-slate-500">{quote.customer_phone}</p>
                        <p className="text-xs text-slate-500 sm:hidden">{quote.destinations?.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{quote.destinations?.name}</TableCell>
                    {showSalesperson && (
                      <TableCell className="hidden md:table-cell">
                        <div>
                          <p className="text-sm font-medium">{quote.profiles?.full_name || "N/A"}</p>
                          <p className="text-xs text-slate-500">{quote.profiles?.email}</p>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="hidden lg:table-cell">{quote.num_people}</TableCell>
                    <TableCell className="hidden lg:table-cell">{quote.total_days}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{(quote.final_cost || quote.total_cost || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell text-emerald-600 font-medium">
                      ₹{(quote.per_person_cost || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[quote.status]}>
                        <span className="hidden sm:inline">{quote.status}</span>
                        <span className="sm:hidden">{quote.status.charAt(0).toUpperCase()}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-slate-500">
                      {new Date(quote.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Link href={`/sales/quote/${quote.id}`}>
                          <Button variant="ghost" size="icon" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/sales/quote/${quote.id}/pdf`}>
                          <Button variant="ghost" size="icon" title="Download PDF">
                            <Download className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
