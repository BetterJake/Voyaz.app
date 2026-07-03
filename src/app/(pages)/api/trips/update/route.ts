import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const sanitizeCityName = (name: string) =>
  name
    .split(",")[0]
    .replace(/\band\b/gi, "")
    .replace(/[^\w\s\u00C0-\u017F]/g, "")
    .trim();

async function fetchUnsplashImage(query: string): Promise<string | null> {
  try {
    const key = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
    if (!key) return null;
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${key}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.results?.[0]?.urls?.regular || null;
  } catch {
    return null;
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tripId, data: tripData } = body;

    if (!tripId) {
      return NextResponse.json({ error: "Missing tripId" }, { status: 400 });
    }

    // Resolve banner image only if user didn't provide one
    let imageUrl: string | undefined = tripData.image_url;
    const isPlaceholder = !imageUrl || imageUrl.includes("generated-trips.png");
    if (isPlaceholder) {
      // Use only the first city/destination name for cleaner Unsplash search
      const rawDestination = tripData.destination || tripData.title || "Travel";
      const firstCity = rawDestination.split(/[&,]/)[0].trim();
      const query = sanitizeCityName(firstCity);
      const fetched = await fetchUnsplashImage(query);
      if (fetched) imageUrl = fetched;
      // else keep whatever is already in the DB (don't include image_url in payload)
    }

    const updatePayload: Record<string, any> = {
      title: tripData.title,
      description: tripData.description,
      summary: tripData.summary,
      destination: tripData.destination,
      vibe: tripData.vibe,
      energy_level: tripData.energy_level,
      visibility: tripData.visibility,
      category: tripData.category,
    };

    // Only update itinerary if it was passed
    if (tripData.itinerary) {
      updatePayload.itinerary = tripData.itinerary;
    }
    if (tripData.days !== undefined) {
      updatePayload.days = tripData.days;
    }
    if (tripData.places_count !== undefined) {
      updatePayload.places_count = tripData.places_count;
    }
    if (tripData.price_total !== undefined) {
      updatePayload.price_total = tripData.price_total;
    }

    // Only update image_url if we have a real one
    if (imageUrl && !imageUrl.includes("generated-trips.png")) {
      updatePayload.image_url = imageUrl;
    }

    console.log(
      "[/api/trips/update] Updating tripId:",
      tripId,
      "keys:",
      Object.keys(updatePayload)
    );

    const { data: trip, error } = await supabase
      .from("trips")
      .update(updatePayload)
      .eq("id", tripId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("[/api/trips/update] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ trip });
  } catch (err: any) {
    console.error("[/api/trips/update] Unexpected:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
