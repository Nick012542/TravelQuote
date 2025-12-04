// List of Indian regions and popular destinations for autocomplete
export const indianDestinations = [
  "North India",
  "South India",
  "East India",
  "West India",
  "Central India",
  "North East India",
  "Himalayan Region",
  "Coastal India",
  "Desert Region",
  "Hill Stations",
]

// Popular tourist places by region - includes places from all states in that region
export const touristPlacesByDestination: Record<string, string[]> = {
  "North India": [
    // Delhi
    "Delhi",
    "Red Fort",
    "Qutub Minar",
    "India Gate",
    "Lotus Temple",
    "Chandni Chowk",
    // Uttar Pradesh
    "Agra",
    "Taj Mahal",
    "Varanasi",
    "Lucknow",
    "Mathura",
    "Vrindavan",
    "Ayodhya",
    "Allahabad",
    // Punjab
    "Amritsar",
    "Golden Temple",
    "Wagah Border",
    "Chandigarh",
    "Ludhiana",
    "Patiala",
    // Haryana
    "Gurgaon",
    "Kurukshetra",
    "Panipat",
    "Faridabad",
    // Himachal Pradesh
    "Shimla",
    "Manali",
    "Dharamshala",
    "McLeod Ganj",
    "Dalhousie",
    "Kullu",
    "Kasol",
    "Spiti Valley",
    // Uttarakhand
    "Nainital",
    "Mussoorie",
    "Rishikesh",
    "Haridwar",
    "Dehradun",
    "Jim Corbett",
    "Auli",
    // Jammu & Kashmir
    "Srinagar",
    "Gulmarg",
    "Pahalgam",
    "Sonmarg",
    "Dal Lake",
    "Vaishno Devi",
    "Patnitop",
    // Ladakh
    "Leh",
    "Pangong Lake",
    "Nubra Valley",
    "Khardung La",
    "Tso Moriri",
  ],
  "South India": [
    // Kerala
    "Munnar",
    "Alleppey",
    "Kochi",
    "Thekkady",
    "Wayanad",
    "Kovalam",
    "Varkala",
    "Kumarakom",
    // Tamil Nadu
    "Chennai",
    "Ooty",
    "Kodaikanal",
    "Mahabalipuram",
    "Madurai",
    "Kanyakumari",
    "Rameswaram",
    "Pondicherry",
    // Karnataka
    "Bangalore",
    "Mysore",
    "Coorg",
    "Hampi",
    "Gokarna",
    "Chikmagalur",
    "Mangalore",
    "Udupi",
    // Andhra Pradesh
    "Hyderabad",
    "Tirupati",
    "Visakhapatnam",
    "Araku Valley",
    "Vijayawada",
    // Telangana
    "Warangal",
    "Nagarjuna Sagar",
  ],
  "East India": [
    // West Bengal
    "Kolkata",
    "Darjeeling",
    "Kalimpong",
    "Siliguri",
    "Sundarbans",
    "Digha",
    "Shantiniketan",
    // Odisha
    "Bhubaneswar",
    "Puri",
    "Konark",
    "Chilika Lake",
    "Gopalpur",
    // Bihar
    "Bodh Gaya",
    "Patna",
    "Nalanda",
    "Rajgir",
    "Vaishali",
    // Jharkhand
    "Ranchi",
    "Jamshedpur",
    "Deoghar",
    "Netarhat",
  ],
  "West India": [
    // Maharashtra
    "Mumbai",
    "Pune",
    "Lonavala",
    "Mahabaleshwar",
    "Shirdi",
    "Nashik",
    "Aurangabad",
    "Ajanta Caves",
    "Ellora Caves",
    // Gujarat
    "Ahmedabad",
    "Gir National Park",
    "Rann of Kutch",
    "Dwarka",
    "Somnath",
    "Vadodara",
    "Kutch",
    "Diu",
    // Goa
    "Panaji",
    "Calangute Beach",
    "Baga Beach",
    "Anjuna Beach",
    "Palolem Beach",
    "Old Goa",
    "Dudhsagar Falls",
    // Rajasthan (partly)
    "Udaipur",
    "Mount Abu",
  ],
  "Central India": [
    // Madhya Pradesh
    "Khajuraho",
    "Bhopal",
    "Indore",
    "Gwalior",
    "Ujjain",
    "Sanchi",
    "Pachmarhi",
    "Kanha",
    "Bandhavgarh",
    "Orchha",
    // Chhattisgarh
    "Raipur",
    "Jagdalpur",
    "Chitrakote Falls",
    "Bastar",
  ],
  "North East India": [
    // Sikkim
    "Gangtok",
    "Pelling",
    "Lachung",
    "Tsomgo Lake",
    "Nathula Pass",
    "Ravangla",
    "Gurudongmar Lake",
    // Meghalaya
    "Shillong",
    "Cherrapunji",
    "Mawlynnong",
    "Dawki",
    "Living Root Bridges",
    // Assam
    "Guwahati",
    "Kaziranga",
    "Majuli Island",
    "Kamakhya Temple",
    "Tezpur",
    // Arunachal Pradesh
    "Tawang",
    "Itanagar",
    "Ziro Valley",
    "Bomdila",
    "Dirang",
    // Nagaland
    "Kohima",
    "Dimapur",
    "Hornbill Festival",
    // Manipur
    "Imphal",
    "Loktak Lake",
    // Mizoram
    "Aizawl",
    // Tripura
    "Agartala",
    "Ujjayanta Palace",
  ],
  "Himalayan Region": [
    // Himachal Pradesh
    "Manali",
    "Shimla",
    "Dharamshala",
    "McLeod Ganj",
    "Dalhousie",
    "Kullu",
    "Kasol",
    "Spiti Valley",
    "Kinnaur",
    "Rohtang Pass",
    // Uttarakhand
    "Nainital",
    "Mussoorie",
    "Rishikesh",
    "Haridwar",
    "Auli",
    "Chopta",
    "Valley of Flowers",
    "Kedarnath",
    "Badrinath",
    // Sikkim
    "Gangtok",
    "Pelling",
    "Lachung",
    "Yuksom",
    "Ravangla",
    // Jammu & Kashmir
    "Srinagar",
    "Gulmarg",
    "Pahalgam",
    "Sonmarg",
    // Ladakh
    "Leh",
    "Pangong Lake",
    "Nubra Valley",
    "Khardung La",
    "Zanskar Valley",
    // Arunachal Pradesh
    "Tawang",
    "Bomdila",
    "Sela Pass",
  ],
  "Coastal India": [
    // Goa
    "Panaji",
    "Calangute",
    "Baga",
    "Anjuna",
    "Palolem",
    "Vagator",
    "Arambol",
    // Kerala
    "Kovalam",
    "Varkala",
    "Alleppey",
    "Kochi",
    "Kumarakom",
    // Karnataka
    "Gokarna",
    "Mangalore",
    "Udupi",
    "Karwar",
    // Maharashtra
    "Mumbai",
    "Alibaug",
    "Ganpatipule",
    "Tarkarli",
    // Tamil Nadu
    "Chennai",
    "Mahabalipuram",
    "Rameswaram",
    "Kanyakumari",
    // Andaman
    "Port Blair",
    "Havelock Island",
    "Neil Island",
    "Radhanagar Beach",
    // Odisha
    "Puri",
    "Gopalpur",
    "Chandipur",
    // Gujarat
    "Diu",
    "Dwarka",
    "Somnath",
  ],
  "Desert Region": [
    // Rajasthan
    "Jaisalmer",
    "Jodhpur",
    "Bikaner",
    "Jaipur",
    "Udaipur",
    "Pushkar",
    "Ajmer",
    "Ranthambore",
    "Mandawa",
    // Gujarat
    "Rann of Kutch",
    "Bhuj",
    "Little Rann of Kutch",
  ],
  "Hill Stations": [
    // Himachal
    "Shimla",
    "Manali",
    "Dalhousie",
    "Dharamshala",
    "Kasol",
    "Khajjiar",
    // Uttarakhand
    "Nainital",
    "Mussoorie",
    "Ranikhet",
    "Almora",
    "Lansdowne",
    "Mukteshwar",
    "Kausani",
    // Tamil Nadu
    "Ooty",
    "Kodaikanal",
    "Coonoor",
    "Yercaud",
    // Kerala
    "Munnar",
    "Wayanad",
    "Thekkady",
    // Karnataka
    "Coorg",
    "Chikmagalur",
    // West Bengal
    "Darjeeling",
    "Kalimpong",
    // Maharashtra
    "Lonavala",
    "Mahabaleshwar",
    "Matheran",
    "Panchgani",
    // Madhya Pradesh
    "Pachmarhi",
    // Gujarat
    "Saputara",
    // Jammu & Kashmir
    "Gulmarg",
    "Pahalgam",
  ],
}

// Get suggestions based on input
export function getDestinationSuggestions(input: string): string[] {
  if (!input) return []
  const lower = input.toLowerCase()
  return indianDestinations.filter((dest) => dest.toLowerCase().includes(lower)).slice(0, 10)
}

// Get place suggestions for a destination
export function getPlaceSuggestions(destination: string, input: string): string[] {
  if (!input) return []
  const places = touristPlacesByDestination[destination] || []
  const lower = input.toLowerCase()
  return places.filter((place) => place.toLowerCase().includes(lower)).slice(0, 10)
}

// Get all places for a destination (for dropdown)
export function getAllPlacesForDestination(destination: string): string[] {
  return touristPlacesByDestination[destination] || []
}
