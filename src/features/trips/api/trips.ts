import { Trip, SaveTripData } from "../types";
import * as Notifications from "@/features/social/api/notifications";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export async function saveTrip(userId: string, data: SaveTripData): Promise<Trip> {
  console.log("[saveTrip] Routing INSERT through server API route...");

  const response = await fetch("/api/trips/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    console.error("[saveTrip] Server API error:", err);
    throw new Error(err.error || "Failed to save trip");
  }

  const { trip } = await response.json();
  console.log("[saveTrip] Trip saved via server API, ID:", trip?.id);
  return trip;
}

export async function getUserTrips(userId: string): Promise<Trip[]> {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getSharedWithMeTrips(userId: string): Promise<Trip[]> {
  const { data: shares, error: shareError } = await supabase
    .from("trip_shares")
    .select("trip_id")
    .eq("shared_with_id", userId);
  if (shareError) throw shareError;

  const sharedIds = shares?.map((s) => s.trip_id) || [];
  if (sharedIds.length === 0) return [];

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .in("id", sharedIds)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function shareTrip(
  tripId: string,
  sharedWithId: string,
  permission: "view" | "edit" = "view"
) {
  const payload = {
    trip_id: tripId,
    shared_with_id: sharedWithId,
    permission_level: permission,
    status: "pending",
  };
  const { error } = await supabase
    .from("trip_shares")
    .upsert(payload, { onConflict: "trip_id,shared_with_id" });

  if (error) {
    console.error("[shareTrip] Supabase error:", error);
    throw new Error(error.message || "Failed to update database");
  }

  try {
    await Notifications.trigger(sharedWithId, "trip_shared", { trip_id: tripId });
  } catch (err) {
    console.warn("Notification trigger failed, but share was successful:", err);
  }
}

export async function forkTrip(userId: string, originalTrip: any): Promise<Trip> {
  const forkData: any = {
    title: `${originalTrip.title} (Copy)`,
    description: originalTrip.description || originalTrip.summary || "",
    itinerary: originalTrip.itinerary,
    summary: originalTrip.summary || originalTrip.description || "",
    destination: originalTrip.destination || originalTrip.title,
    days: originalTrip.days,
    places_count: originalTrip.places_count || originalTrip.places || 0,
    price_total: originalTrip.price_total || originalTrip.price || 0,
    vibe: originalTrip.vibe,
    energy_level: originalTrip.energy_level || originalTrip.energyLevel,
    image_url: originalTrip.image_url || originalTrip.image,
    user_id: userId,
    forked_from_id: originalTrip.id,
    visibility: "private",
    category: originalTrip.category,
    is_template: false,
  };

  const { data: resultData, error } = await supabase
    .from("trips")
    .insert(forkData)
    .select()
    .single();
  if (error) {
    console.error("Supabase error in forkTrip:", error);
    throw error;
  }
  return resultData;
}

export async function addTripParticipant(
  tripId: string,
  userId: string,
  role: "editor" | "viewer" = "viewer"
) {
  const payload = {
    trip_id: tripId,
    shared_with_id: userId,
    permission_level: role === "editor" ? "edit" : "view",
  };
  const { error } = await supabase.from("trip_shares").upsert(payload);
  if (error) throw error;
}

export async function getTripById(tripId: string): Promise<Trip> {
  const { data, error } = await supabase.from("trips").select("*").eq("id", tripId).single();
  if (error) throw error;
  return data;
}

export async function getPublicTrips(): Promise<Trip[]> {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("visibility", "public")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getTripsForUser(
  targetUserId: string,
  currentUserId: string
): Promise<Trip[]> {
  const { data: friendship } = await supabase
    .from("friendships")
    .select("status")
    .or(`user_id.eq.${targetUserId},friend_id.eq.${targetUserId}`)
    .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`)
    .eq("status", "accepted")
    .maybeSingle();

  const isFriend = !!friendship;
  const visibilities = isFriend ? ["public", "friends"] : ["public"];

  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", targetUserId)
    .in("visibility", visibilities)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function deleteTrip(tripId: string) {
  console.log("[deleteTrip] Routing DELETE through server API route...");
  const response = await fetch("/api/trips/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tripId }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || "Failed to delete trip");
  }
}

export async function updateTripVisibility(
  tripId: string,
  visibility: "public" | "friends" | "private"
) {
  const { error } = await supabase.from("trips").update({ visibility }).eq("id", tripId);
  if (error) throw error;
}
