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
import { Plus, Car, Trash2, Bus } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import type { Destination } from "@/lib/types"

interface TransportManagerProps {
  transportPrices: any[]
  destinations: Destination[]
}

export function TransportManager({ transportPrices, destinations }: TransportManagerProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [vehicleFilter, setVehicleFilter] = useState("all")

  const [newTransport, setNewTransport] = useState({
    destination_id: "",
    vehicle_type: "car",
    vehicle_name: "",
    capacity: "",
    price_per_day: "",
  })

  const filteredTransport = transportPrices.filter((transport) => {
    const matchesSearch =
      transport.destination_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transport.vehicle_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transport.vehicle_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesVehicle = vehicleFilter === "all" || transport.vehicle_type === vehicleFilter
    return matchesSearch && matchesVehicle
  })

  const handleAdd = async () => {
    if (!newTransport.destination_id || !newTransport.price_per_day || !newTransport.capacity) return
    setIsLoading(true)

    try {
      const response = await fetch("/api/transport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination_id: newTransport.destination_id,
          vehicle_type: newTransport.vehicle_type,
          vehicle_name: newTransport.vehicle_name || null,
          capacity: Number.parseInt(newTransport.capacity),
          price_per_day: Number.parseFloat(newTransport.price_per_day),
        }),
      })

      if (response.ok) {
        setNewTransport({ destination_id: "", vehicle_type: "car", vehicle_name: "", capacity: "", price_per_day: "" })
        setIsAdding(false)
        router.refresh()
      }
    } catch (error) {
      console.error("Error adding transport:", error)
    }
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transport?")) return
    await fetch(`/api/transport?id=${id}`, { method: "DELETE" })
    router.refresh()
  }

  const vehicleLabels: Record<string, string> = {
    bus: "Bus",
    car: "Car",
    tempo_traveller: "Tempo Traveller",
  }

  const defaultCapacity: Record<string, string> = {
    car: "4",
    bus: "45",
    tempo_traveller: "12",
  }

  const VehicleIcon = ({ type }: { type: string }) => {
    if (type === "bus") return <Bus className="h-4 w-4" />
    return <Car className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Transport</h1>
          <p className="text-slate-600 mt-1">Manage vehicle pricing with seater capacity</p>
        </div>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Vehicle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Destination</Label>
                <Select
                  value={newTransport.destination_id}
                  onValueChange={(value) => setNewTransport({ ...newTransport, destination_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map((dest) => (
                      <SelectItem key={dest.id} value={String(dest.id)}>
                        {dest.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Vehicle Type</Label>
                <Select
                  value={newTransport.vehicle_type}
                  onValueChange={(value) =>
                    setNewTransport({
                      ...newTransport,
                      vehicle_type: value,
                      capacity: defaultCapacity[value] || "",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">Car (4-6 Seater)</SelectItem>
                    <SelectItem value="bus">Bus (40-50 Seater)</SelectItem>
                    <SelectItem value="tempo_traveller">Tempo Traveller (12-17 Seater)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Vehicle Name (Optional)</Label>
                <Input
                  placeholder="e.g., Swift Dzire, Innova, Volvo"
                  value={newTransport.vehicle_name}
                  onChange={(e) => setNewTransport({ ...newTransport, vehicle_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Seater Capacity *</Label>
                <Input
                  type="number"
                  placeholder="e.g., 4, 6, 12, 45"
                  value={newTransport.capacity}
                  onChange={(e) => setNewTransport({ ...newTransport, capacity: e.target.value })}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {newTransport.vehicle_type === "car" && "Typical: 4, 6, 7 seater"}
                  {newTransport.vehicle_type === "bus" && "Typical: 40, 45, 50 seater"}
                  {newTransport.vehicle_type === "tempo_traveller" && "Typical: 12, 14, 17 seater"}
                </p>
              </div>
              <div>
                <Label>Price per Day (INR)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 4500"
                  value={newTransport.price_per_day}
                  onChange={(e) => setNewTransport({ ...newTransport, price_per_day: e.target.value })}
                />
              </div>
              <Button
                onClick={handleAdd}
                disabled={isLoading || !newTransport.destination_id || !newTransport.capacity}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? "Adding..." : "Add Vehicle"}
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
                placeholder="Search by destination or vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery("")}
              />
            </div>
            <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by vehicle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="bus">Bus</SelectItem>
                <SelectItem value="tempo_traveller">Tempo Traveller</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          {filteredTransport.length === 0 ? (
            <div className="py-12 text-center">
              <Car className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">
                {searchQuery || vehicleFilter !== "all"
                  ? "No vehicles match your search criteria"
                  : "No vehicles yet. Add transport options to enable pricing."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead className="hidden sm:table-cell">Destination</TableHead>
                    <TableHead className="text-center">Seater</TableHead>
                    <TableHead className="text-right">Price/Day</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransport.map((transport) => (
                    <TableRow key={transport.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <VehicleIcon type={transport.vehicle_type} />
                          <div>
                            <p className="font-medium">
                              {vehicleLabels[transport.vehicle_type] || transport.vehicle_type}
                              {transport.vehicle_name && ` - ${transport.vehicle_name}`}
                            </p>
                            <p className="text-xs text-slate-500 sm:hidden">{transport.destination_name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{transport.destination_name}</TableCell>
                      <TableCell className="text-center">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm">
                          {transport.capacity || "N/A"} Seater
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{transport.price_per_day?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(transport.id)}>
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
