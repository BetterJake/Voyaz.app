import { NextRequest, NextResponse } from "next/server";

// Maps Google place types to voyaz categories
function mapCategory(types: string[]): string {
  if (!types?.length) return "culture";
  if (types.some((t) => ["lodging", "hotel", "motel", "hostel"].includes(t))) return "sleep";
  if (
    types.some((t) =>
      ["restaurant", "cafe", "coffee_shop", "bakery", "food", "meal_takeaway", "bar"].includes(t)
    )
  )
    return "food";
  if (types.some((t) => ["night_club", "casino", "bar"].includes(t))) return "nightlife";
  if (types.some((t) => ["park", "natural_feature", "campground", "zoo", "aquarium"].includes(t)))
    return "nature";
  return "culture";
}

export async function POST(req: NextRequest) {
  try {
    const { query, location } = await req.json();

    if (!query?.trim()) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Google Places API key not configured" }, { status: 500 });
    }

    const body: Record<string, any> = {
      textQuery: query,
      languageCode: "en",
      maxResultCount: 8,
    };

    // Location bias if we have destination coordinates
    if (location?.lat && location?.lng) {
      body.locationBias = {
        circle: {
          center: { latitude: location.lat, longitude: location.lng },
          radius: 50000, // 50km radius
        },
      };
    }

    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.location",
          "places.websiteUri",
          "places.rating",
          "places.types",
          "places.photos",
          "places.regularOpeningHours",
          "places.priceLevel",
        ].join(","),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[/api/places/search] Google API error:", err);
      return NextResponse.json({ error: "Google Places API error", details: err }, { status: 502 });
    }

    const data = await res.json();
    const places = (data.places || []).map((p: any) => ({
      place_id: p.id,
      name: p.displayName?.text || "Unknown Place",
      address: p.formattedAddress || "",
      lat: p.location?.latitude || 0,
      lng: p.location?.longitude || 0,
      website_url: p.websiteUri || "",
      rating: p.rating || null,
      category: mapCategory(p.types || []),
      types: p.types || [],
      photo_name: p.photos?.[0]?.name || null,
    }));

    return NextResponse.json({ places });
  } catch (err: any) {
    console.error("[/api/places/search] Unexpected error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
