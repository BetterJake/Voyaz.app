"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Day, Place } from "@/features/trips/types";

export type { Day, Place };

export interface Trip {
  id: string;
  user_id?: string;
  visibility?: "public" | "friends" | "private";
  forked_from_id?: string | null;
  image: string;
  title: string;
  days: number;
  places: number;
  price: number;
  description: string;
  vibe: string;
  energyLevel: "Chilled" | "Moderate" | "High";
  itinerary: Day[];
  weather?: {
    temp: number;
    condition: string;
  };
  showWeather?: boolean;
  travel_mode?: "WALKING" | "DRIVING";
  category?: string | null;
  aiMatch?: string;
  priceBreakdown?: {
    hotel: number;
    activities: number;
    food: number;
  };
}

export const useTrips = (options: { targetUserId?: string; mode?: "user" | "discovery" } = {}) => {
  const { targetUserId, mode = "user" } = options;
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();
  const userId = targetUserId || currentUser?.id;

  const queryKey = ["trips", { mode, userId }];

  const { data, isLoading, error, refetch } = useQuery<Trip[]>({
    queryKey,
    queryFn: async () => {
      let dbTrips: any[] | null = null;
      let dbError: any = null;

      if (mode === "discovery") {
        const { data, error } = await supabase
          .from("trips")
          .select("*")
          .eq("visibility", "public")
          .order("created_at", { ascending: false });
        dbTrips = data;
        dbError = error;
      } else if (userId) {
        const { data, error } = await supabase
          .from("trips")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        dbTrips = data;
        dbError = error;
      }

      if (dbError) throw dbError;

      if (dbTrips && dbTrips.length > 0) {
        return dbTrips.map((t) => ({
          id: t.id,
          user_id: t.user_id,
          visibility: t.visibility || "public",
          forked_from_id: t.forked_from_id ?? null,
          image: t.image_url || "/images/trip-placeholder.png",
          title: t.title,
          days: t.days,
          places: t.places_count,
          price: t.price_total,
          description: t.description,
          vibe: t.vibe || "Custom Voyage",
          energyLevel: (t.energy_level as any) || "Moderate",
          itinerary: t.itinerary,
          category: t.category ?? null,
        }));
      }

      // Mock data for discovery mode if no data in DB
      if (mode === "discovery") {
        const locations = [
          {
            title: "Cracow",
            image: "/images/trip-cracow.png",
            vibe: "Historical & Cozy",
            energy: "Chilled",
          },
          {
            title: "Warsaw",
            image: "/images/trip-warsaw.png",
            vibe: "Modern & Dynamic",
            energy: "Moderate",
          },
          {
            title: "London",
            image: "/images/trip-london.png",
            vibe: "Royal & Iconic",
            energy: "High",
          },
          {
            title: "Tokyo",
            image: "/images/trip-tokyo.png",
            vibe: "Neon & Future",
            energy: "High",
          },
          {
            title: "Paris",
            image: "/images/trip-paris.png",
            vibe: "Romantic & Chic",
            energy: "Moderate",
          },
        ];
        return locations.map((loc, idx) => ({
          id: `mock-${idx}`,
          image: loc.image,
          title: loc.title,
          days: (idx % 3) + 3,
          places: 4 + (idx % 5),
          price: 854,
          vibe: loc.vibe,
          energyLevel: loc.energy as any,
          description: `A perfectly balanced journey through ${loc.title}.`,
          weather: { temp: 18, condition: "Partly Cloudy" },
          itinerary: [
            {
              day: 1,
              theme: "City Center Exploration",
              places: [
                {
                  name: "Old Town Market",
                  start_time: "09:00",
                  end_time: "11:00",
                  category: "culture",
                  reason: "Historical point.",
                  lat: 50.0614,
                  lng: 19.9365,
                  website_url: "#",
                },
                {
                  name: "Hidden Garden",
                  start_time: "14:00",
                  end_time: "16:00",
                  category: "nature",
                  reason: "Peaceful escape.",
                  lat: 50.0614,
                  lng: 19.9365,
                  website_url: "#",
                },
              ],
            },
          ],
        }));
      }

      return [];
    },
    enabled: mode === "discovery" || !!userId,
  });

  const trips = useMemo(() => data ?? [], [data]);

  // Example Mutation for deleting a trip
  const deleteTripMutation = useMutation({
    mutationFn: async (tripId: string) => {
      const { error } = await supabase.from("trips").delete().eq("id", tripId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });

  return {
    trips,
    isLoading,
    error: error as Error | null,
    refresh: refetch,
    deleteTrip: deleteTripMutation.mutate,
    isDeleting: deleteTripMutation.isPending,
  };
};
