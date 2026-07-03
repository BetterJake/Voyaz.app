export interface AlternativePlace {
  name: string;
  reason: string;
  price_range?: string;
  average_price?: number;
  rating?: number;
  lat: number;
  lng: number;
}

export interface Place {
  name: string;
  rating?: number;
  address?: string;
  googleMapsUri?: string;
  website_url?: string;
  price_range?: string;
  average_price?: number;
  start_time: string;
  end_time: string;
  reason: string;
  lat: number;
  lng: number;
  category: "culture" | "food" | "nature" | "nightlife" | "sleep" | "parking";
  parking_info?: string;
  alternatives?: AlternativePlace[];
}

export interface Day {
  day: number;
  theme: string;
  weather_forecast?: {
    avg_temp: string;
    condition: string;
  };
  accommodation?: {
    name: string;
    description: string;
    price_per_night: number;
    website_url: string;
    lat: number;
    lng: number;
  };
  places: Place[];
}

export interface TripPlan {
  destination: string;
  summary: string;
  vibe?: string;
  energy_level?: "Low" | "Moderate" | "High";
  ai_reasoning?: string;
  itinerary: Day[];
  category?: string;
}

export interface Trip {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  vibe?: string;
  energy_level?: string;
  image_url?: string;
  itinerary: Day[];
  summary: string;
  destination: string;
  days: number;
  places_count: number;
  price_total: number;
  visibility: "public" | "friends" | "private";
  category?: string | null;
  is_template?: boolean;
  forked_from_id?: string | null;
  created_at: string;
}

export interface SaveTripData {
  title: string;
  description: string;
  vibe?: string;
  energy_level?: string;
  image_url?: string;
  itinerary: Day[];
  summary: string;
  destination: string;
  days: number;
  places_count: number;
  price_total: number;
  visibility?: "public" | "friends" | "private";
  category?: string;
  is_template?: boolean;
}
