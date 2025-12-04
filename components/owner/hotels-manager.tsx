"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Hotel, Trash2, Star } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import { Badge } from "@/components/ui/badge"

interface HotelsManagerProps {
  hotels: any[]
  places: any[]
}

export function HotelsManager({ hotels, places }: HotelsManagerProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const [newHotel, setNewHotel] = useState({
    place_id: "",
    name: "",
    category: "3-star-basic",
    room_type: "Deluxe Room",
    price_ep: "",
    price_cp: "",
    price_map: "",
    price_ap: "",
    extra_adult_with_mattress: "",
    extra_child_without_mattress: "",
  })

  const filteredHotels = hotels.filter((hotel) => {
    const matchesSearch =
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.places?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.places?.destinations?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || hotel.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleAdd = async () => {
    if (!newHotel.name || !newHotel.place_id || !newHotel.price_map) return
    setIsLoading(true)

    try {
      const response = await fetch("/api/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          place_id: newHotel.place_id,
          name: newHotel.name,
          category: newHotel.category,
          room_type: newHotel.room_type,
          price_ep: Number.parseFloat(newHotel.price_ep) || 0,
          price_cp: Number.parseFloat(newHotel.price_cp) || 0,
          price_map: Number.parseFloat(newHotel.price_map) || 0,
          price_ap: Number.parseFloat(newHotel.price_ap) || 0,
          price_per_night: Number.parseFloat(newHotel.price_map) || 0, // Default to MAP price
          extra_adult_with_mattress: Number.parseFloat(newHotel.extra_adult_with_mattress) || 0,
          extra_child_without_mattress: Number.parseFloat(newHotel.extra_child_without_mattress) || 0,
        }),
      })

      if (response.ok) {
        setNewHotel({
          place_id: "",
          name: "",
          category: "3-star-basic",
          room_type: "Deluxe Room",
          price_ep: "",
          price_cp: "",
          price_map: "",
          price_ap: "",
          extra_adult_with_mattress: "",
          extra_child_without_mattress: "",
        })
        setIsAdding(false)
        router.refresh()
      }
    } catch (error) {
      console.error("Error adding hotel:", error)
    }
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this hotel?")) return
    await fetch(`/api/hotels?id=${id}`, { method: "DELETE" })
    router.refresh()
  }

  const getCategoryDisplay = (category: string) => {
    const categoryConfig: Record<string, { stars: number; label: string; color: string }> = {
      "3-star-basic": { stars: 3, label: "Basic", color: "bg-slate-100 text-slate-700" },
      "3-star-premium": { stars: 3, label: "Premium", color: "bg-blue-100 text-blue-700" },
      "4-star": { stars: 4, label: "", color: "bg-amber-100 text-amber-700" },
      "5-star": { stars: 5, label: "", color: "bg-purple-100 text-purple-700" },
    }
    const config = categoryConfig[category] || categoryConfig["3-star-basic"]
    return (
      <div className="flex items-center gap-2">
        <div className="flex">
          {Array(config.stars)
            .fill(null)
            .map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
            ))}
        </div>
        {config.label && (
          <Badge variant="outline" className={config.color}>
            {config.label}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Hotels</h1>
          <p className="text-slate-600 mt-1">Manage hotel pricing with meal plans</p>
        </div>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Hotel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Hotel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Place</Label>
                <Select
                  value={newHotel.place_id}
                  onValueChange={(value) => setNewHotel({ ...newHotel, place_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select place" />
                  </SelectTrigger>
                  <SelectContent>
                    {places.map((place) => (
                      <SelectItem key={place.id} value={String(place.id)}>
                        {place.name} ({place.destination_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Hotel Name</Label>
                <Input
                  placeholder="e.g., Hotel Snow View"
                  value={newHotel.name}
                  onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={newHotel.category}
                    onValueChange={(value) => setNewHotel({ ...newHotel, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3-star-basic">3 Star Basic</SelectItem>
                      <SelectItem value="3-star-premium">3 Star Premium</SelectItem>
                      <SelectItem value="4-star">4 Star</SelectItem>
                      <SelectItem value="5-star">5 Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Room Type</Label>
                  <Input
                    placeholder="e.g., Deluxe Room"
                    value={newHotel.room_type}
                    onChange={(e) => setNewHotel({ ...newHotel, room_type: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-base font-semibold mb-3 block">Meal Plan Pricing (per night)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-slate-500">EP (Room Only)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 2500"
                      value={newHotel.price_ep}
                      onChange={(e) => setNewHotel({ ...newHotel, price_ep: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">CP (Breakfast)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 3000"
                      value={newHotel.price_cp}
                      onChange={(e) => setNewHotel({ ...newHotel, price_cp: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">MAP (B+D) *</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 3500"
                      value={newHotel.price_map}
                      onChange={(e) => setNewHotel({ ...newHotel, price_map: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">AP (All Meals)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 4000"
                      value={newHotel.price_ap}
                      onChange={(e) => setNewHotel({ ...newHotel, price_ap: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-base font-semibold mb-3 block">Extra Bed Charges</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-slate-500">Extra Adult (with mattress)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 1000"
                      value={newHotel.extra_adult_with_mattress}
                      onChange={(e) => setNewHotel({ ...newHotel, extra_adult_with_mattress: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Extra Child (without mattress)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 500"
                      value={newHotel.extra_child_without_mattress}
                      onChange={(e) => setNewHotel({ ...newHotel, extra_child_without_mattress: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleAdd}
                disabled={isLoading || !newHotel.name || !newHotel.place_id || !newHotel.price_map}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? "Adding..." : "Add Hotel"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Search hotels, places, destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery("")}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="3-star-basic">3 Star Basic</SelectItem>
                <SelectItem value="3-star-premium">3 Star Premium</SelectItem>
                <SelectItem value="4-star">4 Star</SelectItem>
                <SelectItem value="5-star">5 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          {filteredHotels.length === 0 ? (
            <div className="py-12 text-center">
              <Hotel className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">
                {searchQuery || categoryFilter !== "all"
                  ? "No hotels match your search criteria"
                  : "No hotels yet. Add hotels to enable pricing."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hotel Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Place</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">EP</TableHead>
                    <TableHead className="text-right hidden md:table-cell">CP</TableHead>
                    <TableHead className="text-right">MAP</TableHead>
                    <TableHead className="text-right hidden md:table-cell">AP</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHotels.map((hotel) => (
                    <TableRow key={hotel.id}>
                      <TableCell className="font-medium">
                        <div>
                          {hotel.name}
                          <p className="text-xs text-slate-500 sm:hidden">
                            {hotel.place_name} ({hotel.destination_name})
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {hotel.place_name}
                        <span className="text-slate-500 text-sm ml-1">({hotel.destination_name})</span>
                      </TableCell>
                      <TableCell>{getCategoryDisplay(hotel.category)}</TableCell>
                      <TableCell className="text-right text-sm">
                        ₹{(hotel.price_ep || hotel.price_per_night || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-sm hidden md:table-cell">
                        ₹{(hotel.price_cp || hotel.price_per_night || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{(hotel.price_map || hotel.price_per_night || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-sm hidden md:table-cell">
                        ₹{(hotel.price_ap || hotel.price_per_night || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(hotel.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
