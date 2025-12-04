"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, MapPin, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import { AutocompleteInput } from "@/components/ui/autocomplete-input"
import { indianDestinations, getAllPlacesForDestination } from "@/lib/indian-destinations"
import type { Destination, Place } from "@/lib/types"

interface DestinationWithPlaces extends Destination {
  places: Place[]
}

interface DestinationsManagerProps {
  destinations: DestinationWithPlaces[]
}

export function DestinationsManager({ destinations }: DestinationsManagerProps) {
  const router = useRouter()
  const [isAddingDestination, setIsAddingDestination] = useState(false)
  const [isAddingPlace, setIsAddingPlace] = useState<string | null>(null)
  const [expandedDestination, setExpandedDestination] = useState<string | null>(null)
  const [newDestination, setNewDestination] = useState({ name: "", description: "" })
  const [newPlace, setNewPlace] = useState({ name: "", description: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentDestinationName, setCurrentDestinationName] = useState("")

  const filteredDestinations = destinations.filter((dest) => {
    const matchesDestination = dest.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPlace = dest.places.some((place) => place.name.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesDestination || matchesPlace
  })

  const handleAddDestination = async () => {
    if (!newDestination.name) return
    setIsLoading(true)

    try {
      const response = await fetch("/api/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDestination),
      })

      if (response.ok) {
        setNewDestination({ name: "", description: "" })
        setIsAddingDestination(false)
        router.refresh()
      }
    } catch (error) {
      console.error("Error adding destination:", error)
    }
    setIsLoading(false)
  }

  const handleAddPlace = async (destinationId: string) => {
    if (!newPlace.name) return
    setIsLoading(true)

    try {
      const response = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination_id: destinationId,
          name: newPlace.name,
          description: newPlace.description,
        }),
      })

      if (response.ok) {
        setNewPlace({ name: "", description: "" })
        setIsAddingPlace(null)
        router.refresh()
      }
    } catch (error) {
      console.error("Error adding place:", error)
    }
    setIsLoading(false)
  }

  const handleDeleteDestination = async (id: string) => {
    if (!confirm("Delete this destination and all its places?")) return
    await fetch(`/api/destinations?id=${id}`, { method: "DELETE" })
    router.refresh()
  }

  const handleDeletePlace = async (id: string) => {
    if (!confirm("Delete this place?")) return
    await fetch(`/api/places?id=${id}`, { method: "DELETE" })
    router.refresh()
  }

  const getPlaceSuggestionsForDestination = (destName: string) => {
    return getAllPlacesForDestination(destName)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Destinations</h1>
          <p className="text-slate-600 mt-1">Manage destinations and places</p>
        </div>
        <Dialog open={isAddingDestination} onOpenChange={setIsAddingDestination}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Destination
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Destination</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="destName">Destination Name</Label>
                <AutocompleteInput
                  id="destName"
                  placeholder="Type to search... (e.g., Uttarakhand, Himachal)"
                  value={newDestination.name}
                  onChange={(value) => setNewDestination({ ...newDestination, name: value })}
                  suggestions={indianDestinations}
                />
              </div>
              <div>
                <Label htmlFor="destDesc">Description</Label>
                <Textarea
                  id="destDesc"
                  placeholder="Brief description..."
                  value={newDestination.description}
                  onChange={(e) => setNewDestination({ ...newDestination, description: e.target.value })}
                />
              </div>
              <Button
                onClick={handleAddDestination}
                disabled={isLoading || !newDestination.name}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? "Adding..." : "Add Destination"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="pt-6">
          <SearchInput
            placeholder="Search destinations or places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
          />
        </CardContent>
      </Card>

      {filteredDestinations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">
              {searchQuery
                ? "No destinations match your search"
                : "No destinations yet. Add your first destination to get started."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDestinations.map((destination) => (
            <Card key={destination.id} className="border-0 shadow-md">
              <CardHeader
                className="cursor-pointer"
                onClick={() =>
                  setExpandedDestination(expandedDestination === String(destination.id) ? null : String(destination.id))
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg">{destination.name}</CardTitle>
                      <p className="text-sm text-slate-600">{destination.places.length} places</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteDestination(String(destination.id))
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    {expandedDestination === String(destination.id) ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {expandedDestination === String(destination.id) && (
                <CardContent className="pt-0">
                  <div className="border-t pt-4 mt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                      <h4 className="font-medium text-slate-700">Places</h4>
                      <Dialog
                        open={isAddingPlace === String(destination.id)}
                        onOpenChange={(open) => {
                          setIsAddingPlace(open ? String(destination.id) : null)
                          if (open) setCurrentDestinationName(destination.name)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Add Place
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Place to {destination.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div>
                              <Label htmlFor="placeName">Place Name</Label>
                              <AutocompleteInput
                                id="placeName"
                                placeholder="Type to search tourist places..."
                                value={newPlace.name}
                                onChange={(value) => setNewPlace({ ...newPlace, name: value })}
                                suggestions={getPlaceSuggestionsForDestination(destination.name)}
                              />
                              <p className="text-xs text-slate-500 mt-1">Popular places will appear as you type</p>
                            </div>
                            <div>
                              <Label htmlFor="placeDesc">Description</Label>
                              <Textarea
                                id="placeDesc"
                                placeholder="Brief description..."
                                value={newPlace.description}
                                onChange={(e) => setNewPlace({ ...newPlace, description: e.target.value })}
                              />
                            </div>
                            <Button
                              onClick={() => handleAddPlace(String(destination.id))}
                              disabled={isLoading || !newPlace.name}
                              className="w-full bg-emerald-600 hover:bg-emerald-700"
                            >
                              {isLoading ? "Adding..." : "Add Place"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {destination.places.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">No places added yet</p>
                    ) : (
                      <div className="grid gap-2">
                        {destination.places.map((place) => (
                          <div key={place.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div>
                              <p className="font-medium text-slate-800">{place.name}</p>
                              {place.description && <p className="text-sm text-slate-600">{place.description}</p>}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDeletePlace(String(place.id))}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
