import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 60;

const PlaceSchema = z.object({
  name: z
    .string()
    .min(1)
    .describe("Precise name of the place for Google Maps searching (e.g. 'Puro Hotel, Warsaw')"),
  rating: z.number().optional(),
  address: z.string().optional(),
  website_url: z
    .string()
    .optional()
    .describe(
      "OPTIONAL: Only provide if you are 100% sure. Otherwise, leave empty as the system will fetch it."
    ),
  price_range: z
    .string()
    .min(1)
    .describe(
      "MANDATORY: Realistic price range, e.g. '20-50 PLN' or 'Free'. Use the user's preferred currency."
    ),
  average_price: z
    .number()
    .optional()
    .describe("MANDATORY: Numeric value for cost calculation in user's preferred currency."),
  start_time: z.string(),
  end_time: z.string(),
  reason: z.string(),
  category: z.enum(["culture", "food", "nature", "nightlife", "sleep", "parking"]),
  parking_info: z.string().optional(),
  walking_time_to_next: z
    .string()
    .optional()
    .describe(
      "Estimated walking time to the next place in the itinerary (e.g., '15 min walk'). Leave empty for the last place of the day."
    ),
});

const DaySchema = z.object({
  day: z.number(),
  theme: z.string(),
  weather_forecast: z
    .object({
      avg_temp: z.string(),
      condition: z.string(),
    })
    .optional()
    .describe("Daily weather forecast"),
  accommodation: z
    .object({
      name: z.string().describe("Precise hotel name for Google Maps searching"),
      description: z.string(),
      price_per_night: z.number().describe("Numeric cost per night in user's preferred currency"),
      website_url: z.string().optional().describe("OPTIONAL URL"),
    })
    .optional(),
  places: z.array(PlaceSchema),
});

const TripPlanSchema = z.object({
  chat_message: z
    .string()
    .describe(
      "Professional response from the AI architect. Include a brief total cost summary at the end of the message."
    ),
  trip_plan: z.object({
    destination: z.string(),
    summary: z.string(),
    vibe: z.string(),
    energy_level: z.enum(["Low", "Moderate", "High"]),
    ai_reasoning: z.string(),
    weather_forecast: z.object({
      avg_temp: z.string(),
      condition: z.string(),
    }),
    category: z.enum(["Europe", "Asia", "Americas", "Africa", "Oceania"]),
    price_summary: z
      .object({
        accommodation_total: z.number(),
        activities_total: z.number(),
        food_total: z.number(),
        total_estimated: z.number(),
        currency: z
          .string()
          .describe("The currency code used for all numerical values (e.g., 'PLN', 'USD')"),
      })
      .describe("Mandatory estimated cost breakdown"),
    itinerary: z.array(DaySchema),
  }),
});

export async function POST(req: Request) {
  try {
    const { messages, userPreferences } = await req.json();

    const rawApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    // Remove quotes if present and trim
    const apiKey = rawApiKey?.replace(/^["']|["']$/g, "").trim();

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "AI trip generation is disabled in this demo deployment. To enable it, set the GOOGLE_GENERATIVE_AI_API_KEY environment variable (Google AI Studio key).",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
    });

    const { budget, parking_required, preferred_currency, is_refinement } = userPreferences || {};

    const limitedMessages = messages.length > 10 ? messages.slice(-10) : messages;

    const modificationModeBlock = is_refinement
      ? `
    ⚠️ MODIFICATION MODE - CRITICAL RULES:
    - The conversation contains a CURRENT_PLAN_CONTEXT message with the full existing plan JSON.
    - You MUST use that plan as the BASE. You are a SURGICAL EDITOR, not a new planner.
    - ONLY apply changes that the user explicitly requested.
    - Carry over all existing days and places unchanged, except for the specific edit.
    `
      : "";

    const { object } = await generateObject({
      model: google("gemini-2.5-pro"), // Updated to 2.5 Pro
      schema: TripPlanSchema,
      system: `ROLE: You are the VOYAZ Lead Strategist - a world-class travel architect.
${modificationModeBlock}
    CORE MANDATES:
    1. TRAVEL ONLY: Refuse any non-travel related requests.
    2. QUALITY SELECTION: Prioritize places with the highest ratings and best reviews that match the user's vibe and travel style.
    3. ACCOMMODATION: Suggest one high-quality hotel/stay matching the budget (${budget || 2500} ${preferred_currency || "PLN"}).
    4. GEOGRAPHICAL CLUSTERING: Each day MUST focus on one specific neighborhood or district. All places in a single day MUST be within walking distance (max 2-3km apart).
    5. DAILY FLOW: 09:00 (Culture) -> 12:00 (Lunch) -> 14:00 (Activity) -> 19:00 (Dinner/Nightlife).
    6. SEARCH NAMES: Use extremely precise, official names for Google Maps searching (e.g., "The Louvre Museum" instead of just "Louvre").
    7. COORDINATES & LINKS: Provide latitude and longitude only if you are 100% certain. Otherwise, provide extremely precise names, and the system will automatically fetch coordinates and website URLs using the Google Places API.
    8. BUDGET: Total cost MUST NOT exceed ${budget || 2500} ${preferred_currency || "PLN"}.
    9. MULTI-CITY LOGISTICS: Strictly respect city allocation. If a day is assigned to a specific city, EVERY place that day MUST be in that city. NEVER mix distant cities in one day.
    10. WALKING SANITY CHECK: Before returning, verify that 'walking_time_to_next' is realistic. Estimated times MUST reflect actual physical distances between spots in the same city.
    11. MAXIMUM DURATION: NEVER create or modify a plan to exceed a total of 7 days. This is a strict system limit.
    12. RADIAL CONSTRAINT (CRITICAL): Every suggested attraction, restaurant, or hotel MUST be within a maximum radius of 5km from the center of the assigned city. If the city is small (like Wolbrom), do not suggest places from nearby big cities (like Krakow or Gdansk) unless explicitly asked.
    13. CURRENCY & PRICING (SOPHISTICATED):
        - IN CHAT MESSAGE: Always use the LOCAL currency of the destination (e.g., Use € for Paris, £ for London, zł for Poland) as found on official sites/Google Places.
        - IN PRICE_RANGE: Use the LOCAL currency of the destination (e.g., "45 €", "120 zł").
        - IN NUMERICAL FIELDS (average_price, price_per_night, price_summary): Convert everything to the user's PREFERRED_CURRENCY (${preferred_currency || "PLN"}).
        - RATIONALE: The user wants to see the "authentic" price in the chat/labels, but the system needs consistent numbers in ${preferred_currency || "PLN"} for the budget engine.

    QUALITY STANDARDS:
    9. SUMMARY: 2-3 immersive sentences.
    10. PLACE REASONS: EXACTLY 2 sentences per place.
    11. PRICE RANGE: MANDATORY (e.g., "50 €", "Free"). Use local destination currency.
    12. DAY THEME: 3-5 word poetic phrase.
    13. WEATHER: Provide avg_temp and condition for every day.
    14. PRICE SUMMARY: Calculate breakdown in ${preferred_currency || "PLN"} and include it in 'price_summary'. Mention the total in ${preferred_currency || "PLN"} at the end of 'chat_message'.

    TONE: Professional travel architect.`,
      messages: limitedMessages,
    });

    console.log("[API/Chat] AI Response generated successfully.");
    if (object.trip_plan) {
      const placesCount = object.trip_plan.itinerary.reduce((acc, d) => acc + d.places.length, 0);
      console.log(
        `[API/Chat] Plan for ${object.trip_plan.destination}: ${object.trip_plan.itinerary.length} days, ${placesCount} places.`
      );
      // Check if coordinates were accidentally provided
      const hasCoords = object.trip_plan.itinerary.some((d) =>
        d.places.some((p) => (p as any).lat || (p as any).lng)
      );
      console.log(`[API/Chat] Coordinates present in AI response: ${hasCoords}`);
    }

    return new Response(JSON.stringify(object), {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (error) {
    console.error("VOYAZ_ENGINE_CRITICAL_ERROR:", error);

    const isValidationError = error instanceof Error && error.name === "ZodError";
    return new Response(
      JSON.stringify({
        error: isValidationError
          ? "The AI returned data in an unexpected format. Please try again."
          : "Trip generation failed. Please try again in a moment.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
