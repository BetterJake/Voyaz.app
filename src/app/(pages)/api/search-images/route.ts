import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Missing query param ?q=" }, { status: 400 });
  }

  const ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  if (!ACCESS_KEY) {
    return NextResponse.json({ results: [] });
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!res.ok) throw new Error("Unsplash API error");
    const data = await res.json();

    const results = (data.results || []).map((photo: any) => ({
      id: photo.id,
      thumb: photo.urls.small,
      regular: photo.urls.regular,
      alt: photo.alt_description || query,
      photographer: photo.user.name,
    }));

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error("[/api/search-images]", err.message);
    return NextResponse.json({ results: [] });
  }
}
