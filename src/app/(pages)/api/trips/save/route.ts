import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getCityImage } from "@/utils/unsplash";

const sanitizeCityName = (name: string) => {
  return name
    .split(",")[0]
    .replace(/\band\b/gi, "")
    .replace(/[^\w\s\u00C0-\u017F]/g, "")
    .trim();
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify the user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { data: tripData } = body;

    // Fetch city image
    let imageUrl = tripData.image_url;
    const isPlaceholder = !imageUrl || imageUrl.includes("generated-trips.png");
    if (isPlaceholder) {
      try {
        // Use only the first city/destination name for cleaner Unsplash search
        const rawDestination = tripData.destination || tripData.title || "Travel";
        const firstCity = rawDestination.split(/[&,]/)[0].trim();
        const query = sanitizeCityName(firstCity);
        imageUrl = await getCityImage(query);
      } catch {
        imageUrl = "/images/generated-trips.png";
      }
    }

    const payload = {
      user_id: user.id,
      title: tripData.title || "New Voyage",
      description: tripData.description || "",
      itinerary: tripData.itinerary || [],
      summary: tripData.summary || tripData.description || "",
      destination: tripData.destination || tripData.title || "",
      days: tripData.days || 1,
      places_count: tripData.places_count || 0,
      price_total: tripData.price_total || 0,
      vibe: tripData.vibe || "Custom",
      energy_level: tripData.energy_level || "Moderate",
      image_url: imageUrl,
      visibility: tripData.visibility || "private",
      category: tripData.category || null,
      is_template: tripData.is_template || false,
    };

    const { data, error } = await supabase.from("trips").insert([payload]).select().single();

    if (error) {
      console.error("[/api/trips/save] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ trip: data });
  } catch (err: any) {
    console.error("[/api/trips/save] Unexpected error:", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
