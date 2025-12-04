"use client"

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import {
  MapPin,
  Train,
  Car,
  Hotel,
  User,
  Plus,
  Trash2,
  Calculator,
  CalendarIcon,
  Users,
  Baby,
  BedDouble,
  FileText,
} from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import type { Destination, Place, Hotel as HotelType, TrainPrice, TransportPrice } from "@/lib/types"
import { cn } from "@/lib/utils"

interface DestinationWithPlaces extends Destination {
  places: Place[]
}

interface HotelWithPlace extends HotelType {
  places: { name: string; destination_id: string }
}

interface ItineraryStop {
  placeId: string
  placeName: string
  hotelId: string
  hotelName: string
  hotelCategory: string
  roomType: string
  hotelPrice: number
  extraAdultPrice: number
  extraChildPrice: number
  days: number
  nights: number
  checkInDate: string
  checkOutDate: string
  mealPlan: string
}

interface QuoteBuilderProps {
  destinations: DestinationWithPlaces[]
  hotels: HotelWithPlace[]
  trainPrices: TrainPrice[]
  transportPrices: TransportPrice[]
  userId: string
}

export function QuoteBuilder({ destinations, hotels, trainPrices, transportPrices, userId }: QuoteBuilderProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Customer details
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")

  // Trip details
  const [selectedDestination, setSelectedDestination] = useState("")
  const [numAdults, setNumAdults] = useState(2)
  const [numChildren, setNumChildren] = useState(0)
  const [extraAdultCount, setExtraAdultCount] = useState(0)
  const [extraChildCount, setExtraChildCount] = useState(0)

  const [arrivalDate, setArrivalDate] = useState<Date | undefined>(undefined)
  const [departureDate, setDepartureDate] = useState<Date | undefined>(undefined)

  // Train
  const [trainClass, setTrainClass] = useState("")
  const [selectedTrainRoute, setSelectedTrainRoute] = useState("")

  // Transport
  const [transportType, setTransportType] = useState("")
  const [selectedTransport, setSelectedTransport] = useState("")

  // Itinerary
  const [itinerary, setItinerary] = useState<ItineraryStop[]>([])

  const [destinationSearch, setDestinationSearch] = useState("")
  const [placeSearch, setPlaceSearch] = useState("")
  const [hotelSearch, setHotelSearch] = useState("")

  const numPeople = numAdults + numChildren

  const filteredDestinations = destinations.filter((dest) =>
    dest.name.toLowerCase().includes(destinationSearch.toLowerCase()),
  )

  // Get places for selected destination
  const availablePlaces = useMemo(() => {
    const dest = destinations.find((d) => d.id === selectedDestination)
    return dest?.places || []
  }, [selectedDestination, destinations])

  const filteredPlaces = availablePlaces.filter((place) => place.name.toLowerCase().includes(placeSearch.toLowerCase()))

  // Get hotels for selected destination
  const availableHotels = useMemo(() => {
    return hotels.filter((h) => h.places?.destination_id === selectedDestination)
  }, [selectedDestination, hotels])

  const filteredHotels = availableHotels.filter((hotel) => hotel.name.toLowerCase().includes(hotelSearch.toLowerCase()))

  // Get transport for selected destination
  const availableTransport = useMemo(() => {
    return transportPrices.filter((t) => t.destination_id === selectedDestination)
  }, [selectedDestination, transportPrices])

  const selectedTrainInfo = useMemo(() => {
    if (!selectedTrainRoute) return null
    const train = trainPrices.find((t) => t.id === selectedTrainRoute)
    if (!train) return null
    // Handle both from_city/to_city and from_location/to_location
    const fromCity = train.from_city || train.from_location || ""
    const toCity = train.to_city || train.to_location || ""
    return { ...train, from_city: fromCity, to_city: toCity }
  }, [selectedTrainRoute, trainPrices])

  const costs = useMemo(() => {
    let trainCost = 0
    let transportCost = 0
    let hotelCost = 0
    let extraAdultCost = 0
    let extraChildCost = 0
    let totalDays = 0
    let totalNights = 0

    // Train cost
    if (selectedTrainRoute && trainClass) {
      const train = trainPrices.find((t) => t.id === selectedTrainRoute && t.class === trainClass)
      if (train) {
        const pricePerPerson = train.price_per_person || train.price || 0
        trainCost = pricePerPerson * numPeople * 2 // Round trip
      }
    }

    // Transport cost
    if (selectedTransport) {
      const transport = availableTransport.find((t) => t.id === selectedTransport)
      if (transport) {
        totalDays = itinerary.reduce((sum, stop) => sum + stop.days, 0)
        transportCost = transport.price_per_day * totalDays
      }
    }

    // Hotel cost with extra beds - using meal plan pricing
    itinerary.forEach((stop) => {
      if (stop.hotelPrice) {
        const roomsNeeded = Math.ceil(numPeople / 2)
        hotelCost += stop.hotelPrice * stop.nights * roomsNeeded
        // Extra adult with mattress cost
        if (extraAdultCount > 0 && stop.extraAdultPrice) {
          extraAdultCost += stop.extraAdultPrice * stop.nights * extraAdultCount
        }
        // Extra child without mattress cost
        if (extraChildCount > 0 && stop.extraChildPrice) {
          extraChildCost += stop.extraChildPrice * stop.nights * extraChildCount
        }
      }
      totalNights += stop.nights
    })

    const subtotal = trainCost + transportCost + hotelCost + extraAdultCost + extraChildCost
    const perPersonCost = numPeople > 0 ? Math.ceil(subtotal / numPeople) : 0

    return {
      trainCost,
      transportCost,
      hotelCost,
      extraAdultCost,
      extraChildCost,
      subtotal,
      totalCost: subtotal, // No margin/GST for salesperson
      perPersonCost,
      totalDays,
      totalNights,
    }
  }, [
    selectedTrainRoute,
    trainClass,
    selectedTransport,
    itinerary,
    numPeople,
    trainPrices,
    availableTransport,
    extraAdultCount,
    extraChildCount,
  ])

  const addItineraryStop = () => {
    if (availablePlaces.length === 0) return
    let checkIn = arrivalDate
    if (itinerary.length > 0) {
      const lastStop = itinerary[itinerary.length - 1]
      if (lastStop.checkOutDate) checkIn = lastStop.checkOutDate
    }

    setItinerary([
      ...itinerary,
      {
        placeId: "",
        placeName: "",
        hotelId: "",
        hotelName: "",
        hotelCategory: "",
        roomType: "",
        hotelPrice: 0,
        extraAdultPrice: 0,
        extraChildPrice: 0,
        days: 1,
        nights: 1,
        checkInDate: checkIn ? format(checkIn, "yyyy-MM-dd") : "",
        checkOutDate: "",
        mealPlan: "MAP",
      },
    ])
  }

  const updateItineraryStop = (index: number, updates: Partial<ItineraryStop>) => {
    const newItinerary = [...itinerary]
    newItinerary[index] = { ...newItinerary[index], ...updates }
    if (updates.nights !== undefined || updates.checkInDate !== undefined) {
      const stop = newItinerary[index]
      if (stop.checkInDate && stop.nights) {
        const checkIn = new Date(stop.checkInDate)
        checkIn.setDate(checkIn.getDate() + stop.nights)
        stop.checkOutDate = format(checkIn, "yyyy-MM-dd")
      }
    }
    setItinerary(newItinerary)
  }

  const removeItineraryStop = (index: number) => {
    setItinerary(itinerary.filter((_, i) => i !== index))
  }

  const handlePlaceSelect = (index: number, placeId: string) => {
    const place = availablePlaces.find((p) => p.id === placeId)
    updateItineraryStop(index, {
      placeId,
      placeName: place?.name || "",
      hotelId: "",
      hotelName: "",
      hotelCategory: "",
      roomType: "",
      hotelPrice: 0,
      extraAdultPrice: 0,
      extraChildPrice: 0,
    })
  }

  const handleHotelSelect = (index: number, hotelId: string, mealPlan?: string) => {
    const hotel = availableHotels.find((h) => h.id === hotelId)
    const currentMealPlan = mealPlan || itinerary[index]?.mealPlan || "MAP"

    // Get price based on meal plan
    let hotelPrice = hotel?.price_per_night || 0
    if (hotel) {
      switch (currentMealPlan) {
        case "EP":
          hotelPrice = hotel.price_ep || hotel.price_per_night || 0
          break
        case "CP":
          hotelPrice = hotel.price_cp || hotel.price_per_night || 0
          break
        case "MAP":
          hotelPrice = hotel.price_map || hotel.price_per_night || 0
          break
        case "AP":
          hotelPrice = hotel.price_ap || hotel.price_per_night || 0
          break
      }
    }

    updateItineraryStop(index, {
      hotelId,
      hotelName: hotel?.name || "",
      hotelCategory: hotel?.category || "",
      roomType: hotel?.room_type || "Deluxe Room",
      hotelPrice,
      extraAdultPrice: hotel?.extra_adult_with_mattress || 0,
      extraChildPrice: hotel?.extra_child_without_mattress || 0,
      mealPlan: currentMealPlan,
    })
  }

  const handleMealPlanChange = (index: number, mealPlan: string) => {
    const stop = itinerary[index]
    if (stop.hotelId) {
      handleHotelSelect(index, stop.hotelId, mealPlan)
    } else {
      updateItineraryStop(index, { mealPlan })
    }
  }

  const generatePackageCode = () => {
    const dest = destinations.find((d) => d.id === selectedDestination)
    const prefix = dest?.name?.substring(0, 3).toUpperCase() || "PKG"
    const random = Math.floor(Math.random() * 900000) + 100000
    return `${prefix}${random}`
  }

  const handleSaveQuote = async () => {
    if (!customerName || !customerPhone || !selectedDestination || itinerary.length === 0) {
      alert("Please fill all required fields")
      return
    }
    if (!arrivalDate || !departureDate) {
      alert("Please select arrival and departure dates")
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    const trainRouteInfo = selectedTrainInfo
      ? {
          id: selectedTrainInfo.id,
          from_city: selectedTrainInfo.from_city,
          to_city: selectedTrainInfo.to_city,
          class: trainClass,
          route: `${selectedTrainInfo.from_city}-${selectedTrainInfo.to_city}`,
        }
      : null

    const quoteData = {
      salesperson_id: userId,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail || null,
      destination_id: selectedDestination,
      num_people: numPeople,
      num_adults: numAdults,
      num_children: numChildren,
      extra_adult_count: extraAdultCount,
      extra_child_count: extraChildCount,
      extra_adult_cost: costs.extraAdultCost,
      extra_child_cost: costs.extraChildCost,
      total_days: costs.totalDays,
      arrival_date: arrivalDate ? format(arrivalDate, "yyyy-MM-dd") : "",
      departure_date: departureDate ? format(departureDate, "yyyy-MM-dd") : "",
      package_code: generatePackageCode(),
      train_class: trainClass || null,
      train_cost: costs.trainCost,
      transport_type: transportType || null,
      transport_cost: costs.transportCost,
      hotel_cost: costs.hotelCost,
      total_cost: costs.subtotal,
      per_person_cost: numPeople > 0 ? Math.ceil(costs.subtotal / numPeople) : 0,
      margin_percentage: 0,
      margin_amount: 0,
      final_cost: costs.subtotal,
      final_per_person: costs.perPersonCost,
      gst_percentage: 0,
      meal_plan: itinerary[0]?.mealPlan || "MAP",
      admin_costing: {
        trainCost: costs.trainCost,
        transportCost: costs.transportCost,
        hotelCost: costs.hotelCost,
        extraAdultCost: costs.extraAdultCost,
        extraChildCost: costs.extraChildCost,
        subtotal: costs.subtotal,
      },
      itinerary_data: {
        itinerary,
        trainRoute: trainRouteInfo,
        transport: selectedTransport,
      },
      status: "draft",
    }

    const { data: quote, error } = await supabase.from("quotes").insert(quoteData).select().single()

    if (error) {
      console.error(error)
      alert("Failed to save quote")
    } else {
      router.push(`/sales/quote/${quote.id}/pdf`)
    }
    setIsLoading(false)
  }

  const vehicleLabels: Record<string, string> = { bus: "Bus", car: "Car", tempo_traveller: "Tempo Traveller" }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      "3-star-basic": "3★ Basic",
      "3-star-premium": "3★ Premium",
      "4-star": "4★",
      "5-star": "5★",
    }
    return labels[category] || category
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Create Quote</h1>
        <p className="text-slate-600 mt-1">Build a tour package for your customer</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <User className="h-5 w-5 text-emerald-600" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Customer Name *</Label>
                <Input placeholder="Full name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
              <div>
                <Label>Phone Number *</Label>
                <Input
                  placeholder="+91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
              <div>
                <Label>Email (Optional)</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Trip Details */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <MapPin className="h-5 w-5 text-emerald-600" />
                Trip Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Destination *</Label>
                <Select
                  value={selectedDestination}
                  onValueChange={(v) => {
                    setSelectedDestination(v)
                    setItinerary([])
                    setSelectedTransport("")
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <SearchInput
                        placeholder="Search destinations..."
                        value={destinationSearch}
                        onChange={(e) => setDestinationSearch(e.target.value)}
                        onClear={() => setDestinationSearch("")}
                        className="h-9"
                      />
                    </div>
                    {filteredDestinations.map((dest) => (
                      <SelectItem key={dest.id} value={dest.id}>
                        {dest.name}
                      </SelectItem>
                    ))}
                    {filteredDestinations.length === 0 && (
                      <div className="p-2 text-sm text-slate-500 text-center">No destinations found</div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className="flex items-center gap-1 text-xs sm:text-sm">
                    <Users className="h-3 w-3" /> Adults *
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={numAdults}
                    onChange={(e) => setNumAdults(Number.parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-1 text-xs sm:text-sm">
                    <Baby className="h-3 w-3" /> Children
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={numChildren}
                    onChange={(e) => setNumChildren(Number.parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-1 text-xs sm:text-sm">
                    <BedDouble className="h-3 w-3" /> Extra Adult
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={extraAdultCount}
                    onChange={(e) => setExtraAdultCount(Number.parseInt(e.target.value) || 0)}
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">With mattress</p>
                </div>
                <div>
                  <Label className="flex items-center gap-1 text-xs sm:text-sm">
                    <Baby className="h-3 w-3" /> Extra Child
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={extraChildCount}
                    onChange={(e) => setExtraChildCount(Number.parseInt(e.target.value) || 0)}
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">Without mattress</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" /> Arrival Date *
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !arrivalDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {arrivalDate ? format(new Date(arrivalDate), "PPP") : "Select arrival date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={arrivalDate ? new Date(arrivalDate) : undefined}
                        onSelect={(date) => setArrivalDate(date ? format(date, "yyyy-MM-dd") : "")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" /> Departure Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !departureDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {departureDate ? format(new Date(departureDate), "PPP") : "Select departure date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={departureDate ? new Date(departureDate) : undefined}
                        onSelect={(date) => setDepartureDate(date ? format(date, "yyyy-MM-dd") : "")}
                        disabled={(date) => (arrivalDate ? date < new Date(arrivalDate) : false)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Train */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Train className="h-5 w-5 text-amber-600" /> Train (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Route</Label>
                <Select value={selectedTrainRoute} onValueChange={setSelectedTrainRoute}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      ...new Set(
                        trainPrices.map((t) => {
                          const from = t.from_city || t.from_location || ""
                          const to = t.to_city || t.to_location || ""
                          return `${from}-${to}`
                        }),
                      ),
                    ]
                      .filter((r) => r !== "-")
                      .map((route) => {
                        const train = trainPrices.find((t) => {
                          const from = t.from_city || t.from_location || ""
                          const to = t.to_city || t.to_location || ""
                          return `${from}-${to}` === route
                        })
                        return (
                          <SelectItem key={train?.id} value={train?.id || ""}>
                            {route}
                          </SelectItem>
                        )
                      })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Class</Label>
                <Select value={trainClass} onValueChange={setTrainClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sleeper">Sleeper</SelectItem>
                    <SelectItem value="3ac">3 AC</SelectItem>
                    <SelectItem value="2ac">2 AC</SelectItem>
                    <SelectItem value="1ac">1 AC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transport */}
          {selectedDestination && (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Car className="h-5 w-5 text-sky-600" /> Local Transport
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label>Vehicle</Label>
                  <Select
                    value={selectedTransport}
                    onValueChange={(v) => {
                      setSelectedTransport(v)
                      const transport = availableTransport.find((t) => t.id === v)
                      setTransportType(transport?.vehicle_type || "")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTransport.map((transport) => (
                        <SelectItem key={transport.id} value={transport.id}>
                          {vehicleLabels[transport.vehicle_type]}
                          {transport.vehicle_name && ` - ${transport.vehicle_name}`}
                          {` (${transport.capacity || "N/A"} seater) - ₹${transport.price_per_day}/day`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Itinerary */}
          {selectedDestination && (
            <Card className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Hotel className="h-5 w-5 text-rose-600" /> Itinerary & Hotels
                </CardTitle>
                <Button onClick={addItineraryStop} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-1" /> Add Stop
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {itinerary.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SearchInput
                      placeholder="Search places..."
                      value={placeSearch}
                      onChange={(e) => setPlaceSearch(e.target.value)}
                      onClear={() => setPlaceSearch("")}
                      className="h-9"
                    />
                    <SearchInput
                      placeholder="Search hotels..."
                      value={hotelSearch}
                      onChange={(e) => setHotelSearch(e.target.value)}
                      onClear={() => setHotelSearch("")}
                      className="h-9"
                    />
                  </div>
                )}

                {itinerary.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <MapPin className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    <p>Add stops to build your itinerary</p>
                  </div>
                ) : (
                  itinerary.map((stop, index) => (
                    <div key={index} className="p-3 sm:p-4 bg-slate-50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-emerald-700 border-emerald-300">
                          Stop {index + 1}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={() => removeItineraryStop(index)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Place *</Label>
                          <Select value={stop.placeId} onValueChange={(v) => handlePlaceSelect(index, v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select place" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredPlaces.map((place) => (
                                <SelectItem key={place.id} value={place.id}>
                                  {place.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Hotel</Label>
                          <Select value={stop.hotelId} onValueChange={(v) => handleHotelSelect(index, v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select hotel" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredHotels.map((hotel) => (
                                <SelectItem key={hotel.id} value={hotel.id}>
                                  {hotel.name} ({getCategoryLabel(hotel.category)})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <Label className="text-xs">Days</Label>
                          <Input
                            type="number"
                            min={1}
                            value={stop.days}
                            onChange={(e) => updateItineraryStop(index, { days: Number.parseInt(e.target.value) || 1 })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Nights</Label>
                          <Input
                            type="number"
                            min={0}
                            value={stop.nights}
                            onChange={(e) =>
                              updateItineraryStop(index, { nights: Number.parseInt(e.target.value) || 0 })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Check-in</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                  "w-full justify-start text-left font-normal text-xs h-9",
                                  !stop.checkInDate && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-1 h-3 w-3" />
                                {stop.checkInDate ? format(new Date(stop.checkInDate), "dd/MM/yy") : "Select"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={stop.checkInDate ? new Date(stop.checkInDate) : undefined}
                                onSelect={(date) =>
                                  updateItineraryStop(index, { checkInDate: date ? format(date, "yyyy-MM-dd") : "" })
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label className="text-xs">Check-out</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                  "w-full justify-start text-left font-normal text-xs h-9",
                                  !stop.checkOutDate && "text-muted-foreground",
                                )}
                              >
                                <CalendarIcon className="mr-1 h-3 w-3" />
                                {stop.checkOutDate ? format(new Date(stop.checkOutDate), "dd/MM/yy") : "Select"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={stop.checkOutDate ? new Date(stop.checkOutDate) : undefined}
                                onSelect={(date) =>
                                  updateItineraryStop(index, { checkOutDate: date ? format(date, "yyyy-MM-dd") : "" })
                                }
                                disabled={(date) => (stop.checkInDate ? date <= new Date(stop.checkInDate) : false)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <Label className="text-xs">Meal Plan</Label>
                          <Select value={stop.mealPlan} onValueChange={(v) => handleMealPlanChange(index, v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EP">EP (Room Only)</SelectItem>
                              <SelectItem value="CP">CP (Breakfast)</SelectItem>
                              <SelectItem value="MAP">MAP (B+D)</SelectItem>
                              <SelectItem value="AP">AP (All Meals)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {stop.hotelName && (
                        <div className="text-xs text-slate-500 bg-white p-2 rounded">
                          <span className="font-medium">{stop.hotelName}</span> - {stop.roomType} •{" "}
                          <span className="text-emerald-600 font-medium">₹{stop.hotelPrice}/night</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Cost Summary */}
        <div className="space-y-6">
          <Card className="border-0 shadow-md lg:sticky lg:top-6">
            <CardHeader className="bg-emerald-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" /> Cost Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-600 uppercase">Cost Breakdown</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Train className="h-3 w-3" /> Train
                    </span>
                    <span>₹{costs.trainCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Car className="h-3 w-3" /> Transport
                    </span>
                    <span>₹{costs.transportCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Hotel className="h-3 w-3" /> Hotels
                    </span>
                    <span>₹{costs.hotelCost.toLocaleString()}</span>
                  </div>
                  {extraAdultCount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Extra Adult ({extraAdultCount})</span>
                      <span>₹{costs.extraAdultCost.toLocaleString()}</span>
                    </div>
                  )}
                  {extraChildCount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Extra Child ({extraChildCount})</span>
                      <span>₹{costs.extraChildCost.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-600">Total Cost</span>
                  <span className="text-xl sm:text-2xl font-bold text-slate-800">
                    ₹{costs.totalCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Per Person</span>
                  <span className="text-base sm:text-lg font-semibold text-emerald-600">
                    ₹{costs.perPersonCost.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSaveQuote}
                disabled={isLoading}
              >
                <FileText className="h-4 w-4 mr-2" />
                {isLoading ? "Generating..." : "Generate Quote PDF"}
              </Button>
              <p className="text-xs text-center text-slate-500">Quote will be saved and PDF will be generated</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
