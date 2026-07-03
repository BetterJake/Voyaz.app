const ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
export async function getCityImage(query: string): Promise<string> {
  if (!ACCESS_KEY) {
    return "/images/generated-trips.png";
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${ACCESS_KEY}`,
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error("Unsplash API Error");
    const data = await response.json();
    return data.results[0]?.urls?.regular || "/images/generated-trips.png";
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      console.warn("Unsplash request timed out for query:", query);
    } else {
      console.error("Error fetching from Unsplash:", error);
    }
    return "/images/generated-trips.png";
  }
}
