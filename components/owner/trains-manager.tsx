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
import { Plus, Train, Trash2 } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import type { TrainPrice } from "@/lib/types"

interface TrainsManagerProps {
  trainPrices: TrainPrice[]
}

export function TrainsManager({ trainPrices }: TrainsManagerProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [classFilter, setClassFilter] = useState("all")

  const [newTrain, setNewTrain] = useState({
    from_city: "",
    to_city: "",
    class: "sleeper",
    price_per_person: "",
  })

  const filteredTrainPrices = trainPrices.filter((train) => {
    const fromCity = train.from_city || train.from_location || ""
    const toCity = train.to_city || train.to_location || ""
    const matchesSearch =
      fromCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      toCity.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesClass = classFilter === "all" || train.class === classFilter
    return matchesSearch && matchesClass
  })

  const handleAdd = async () => {
    if (!newTrain.from_city || !newTrain.to_city || !newTrain.price_per_person) return
    setIsLoading(true)

    try {
      const response = await fetch("/api/trains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_city: newTrain.from_city,
          to_city: newTrain.to_city,
          class: newTrain.class,
          price_per_person: Number.parseFloat(newTrain.price_per_person),
        }),
      })

      if (response.ok) {
        setNewTrain({ from_city: "", to_city: "", class: "sleeper", price_per_person: "" })
        setIsAdding(false)
        router.refresh()
      }
    } catch (error) {
      console.error("Error adding train:", error)
    }
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this train route?")) return
    await fetch(`/api/trains?id=${id}`, { method: "DELETE" })
    router.refresh()
  }

  const classLabels: Record<string, string> = {
    sleeper: "Sleeper",
    "3ac": "3 AC",
    "2ac": "2 AC",
    "1ac": "1 AC",
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Train Prices</h1>
          <p className="text-slate-600 mt-1">Manage train route pricing</p>
        </div>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Route
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Train Route</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>From City</Label>
                <Input
                  placeholder="e.g., Delhi"
                  value={newTrain.from_city}
                  onChange={(e) => setNewTrain({ ...newTrain, from_city: e.target.value })}
                />
              </div>
              <div>
                <Label>To City</Label>
                <Input
                  placeholder="e.g., Kalka"
                  value={newTrain.to_city}
                  onChange={(e) => setNewTrain({ ...newTrain, to_city: e.target.value })}
                />
              </div>
              <div>
                <Label>Class</Label>
                <Select value={newTrain.class} onValueChange={(value) => setNewTrain({ ...newTrain, class: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sleeper">Sleeper</SelectItem>
                    <SelectItem value="3ac">3 AC</SelectItem>
                    <SelectItem value="2ac">2 AC</SelectItem>
                    <SelectItem value="1ac">1 AC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price per Person (INR)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 850"
                  value={newTrain.price_per_person}
                  onChange={(e) => setNewTrain({ ...newTrain, price_per_person: e.target.value })}
                />
              </div>
              <Button
                onClick={handleAdd}
                disabled={isLoading || !newTrain.from_city || !newTrain.to_city}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? "Adding..." : "Add Route"}
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
                placeholder="Search by city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery("")}
              />
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="sleeper">Sleeper</SelectItem>
                <SelectItem value="3ac">3 AC</SelectItem>
                <SelectItem value="2ac">2 AC</SelectItem>
                <SelectItem value="1ac">1 AC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          {filteredTrainPrices.length === 0 ? (
            <div className="py-12 text-center">
              <Train className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">
                {searchQuery || classFilter !== "all"
                  ? "No train routes match your search criteria"
                  : "No train routes yet. Add routes to enable pricing."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-right">Price/Person</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrainPrices.map((train) => (
                    <TableRow key={train.id}>
                      <TableCell className="font-medium">{train.from_city || train.from_location || "N/A"}</TableCell>
                      <TableCell>{train.to_city || train.to_location || "N/A"}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-sm">
                          {classLabels[train.class]}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{(train.price_per_person || train.price || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(train.id)}>
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
