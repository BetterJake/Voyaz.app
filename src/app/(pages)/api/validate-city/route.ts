import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const { city } = await req.json();
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json({ error: "API Key missing" }, { status: 500 });
  }
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.types",
      },
      body: JSON.stringify({
        textQuery: city,
        maxResultCount: 1,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        {
          valid: false,
          error: data.error?.message || "Google API error",
          status: res.status,
        },
        { status: res.status }
      );
    }
    const isValid = data.places && data.places.length > 0;
    const isCity =
      isValid &&
      data.places[0].types?.some((t: string) =>
        [
          "locality",
          "administrative_area_level_1",
          "administrative_area_level_2",
          "political",
          "city",
        ].includes(t)
      );
    return NextResponse.json({
      valid: isValid && isCity,
      name: isValid ? data.places[0].displayName.text : null,
    });
  } catch (error) {
    console.error("Internal API Error:", error);
    return NextResponse.json({ valid: false, error: "Internal server error" }, { status: 500 });
  }
}
