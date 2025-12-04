export interface Profile {
  id: number
  email: string
  full_name: string
  role: "owner" | "salesperson"
  is_approved: boolean
  is_primary_admin: boolean
  created_at: string
}

export interface AdminAccount {
  id: string
  email: string
  is_primary: boolean
  created_by: string | null
  created_at: string
}

export interface Destination {
  id: number
  name: string
  description: string
  image_url: string
  created_at: string
}

export interface Place {
  id: number
  destination_id: number
  name: string
  description: string
  created_at: string
}

export interface Hotel {
  id: number
  place_id: number
  name: string
  category: "3_star_basic" | "3_star_premium" | "4_star" | "5_star"
  room_type: string
  price_per_night: number
  price_ep: number
  price_cp: number
  price_map: number
  price_ap: number
  extra_adult_with_mattress: number
  extra_child_without_mattress: number
  description: string
  amenities: string
  is_active: boolean
  created_at: string
}

export interface TrainPrice {
  id: number
  from_city: string
  to_city: string
  from_location?: string
  to_location?: string
  class: string
  price_per_person: number
  price?: number
  is_active: boolean
  created_at: string
}

export interface TransportPrice {
  id: number
  destination_id: number
  vehicle_type: "bus" | "car" | "tempo_traveller"
  vehicle_name: string
  capacity: number
  price_per_day: number
  is_active: boolean
  created_at: string
}

export interface Quote {
  id: number
  salesperson_id: number
  customer_name: string
  customer_phone: string
  customer_email: string
  destination_id: number
  num_people: number
  num_adults: number
  num_children: number
  extra_adult_count: number
  extra_child_count: number
  extra_adult_cost: number
  extra_child_cost: number
  total_days: number
  arrival_date: string
  departure_date: string
  package_code: string
  train_class: string
  train_cost: number
  transport_type: string
  transport_cost: number
  hotel_cost: number
  total_cost: number
  per_person_cost: number
  margin_percentage: number
  margin_amount: number
  final_cost: number
  final_per_person: number
  meal_plan: string
  gst_percentage: number
  itinerary_data: any
  admin_costing: any
  status: "draft" | "confirmed" | "cancelled"
  created_at: string
  updated_at: string
}

export interface QuotePlace {
  id: number
  quote_id: number
  place_id: number
  hotel_id: number
  days: number
  nights: number
  order_index: number
}

export interface ItineraryStop {
  place: Place
  hotel: Hotel | null
  days: number
  nights: number
}

export interface PackagePolicy {
  id: number
  destination_id: number | null
  type: "include" | "exclude" | "payment" | "cancellation"
  description: string
  order_index: number
  is_default: boolean
}

export interface ItineraryTemplate {
  id: number
  place_id: number
  name: string
  description: string
  days: number
  content: string
  created_at: string
}
