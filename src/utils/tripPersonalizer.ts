import { getRealTimeWeather } from "@/utils/weather";
import { Trip } from "@/hooks/useTrips";
import { Country } from "@/hooks/useCountries";
export interface PersonalizationParams {
  activeCountry: Country;
  selectedCity: string | null;
  trips: Trip[];
  skipWeather?: boolean;
}
export const PRIMARY_CITY_MAP: Record<string, string> = {
  Poland: "Warsaw",
  Japan: "Tokyo",
  Germany: "Berlin",
  Spain: "Madrid",
  Thailand: "Thailand",
  Brazil: "Brazil",
  Malta: "Malta",
};
export async function getPersonalizedTrip({
  activeCountry,
  selectedCity,
  trips,
  skipWeather = false,
}: PersonalizationParams): Promise<Trip | null> {
  if (!activeCountry) return null;
  let finalTrip = trips.find(
    (t) => selectedCity && t.title.toLowerCase() === selectedCity.toLowerCase()
  );
  if (!finalTrip) {
    const primaryCity = PRIMARY_CITY_MAP[activeCountry.name];
    finalTrip = trips.find((t) => t.title.toLowerCase() === primaryCity?.toLowerCase());
  }
  if (!finalTrip) {
    finalTrip = trips.find((t) => t.title.toLowerCase().includes(activeCountry.name.toLowerCase()));
  }
  if (!finalTrip && trips.length > 0) {
    finalTrip = trips[0];
  }
  if (!finalTrip) return null;
  if (selectedCity) {
    const city = selectedCity;
    const cityCoords = activeCountry.cityCoords?.[city];
    let weatherData = finalTrip.weather;
    if (!skipWeather && cityCoords) {
      weatherData = await getRealTimeWeather(cityCoords.lat, cityCoords.lng);
    }
    const templateCityName = finalTrip.title;
    const cityImage = activeCountry.cityImages?.[city] || finalTrip.image;
    const getPseudoRandom = (key: string) => {
      let hash = 0;
      for (let i = 0; i < key.length; i++) {
        hash = (hash << 5) - hash + key.charCodeAt(i);
        hash |= 0;
      }
      return (Math.abs(hash) % 1000) / 1000;
    };
    const rebrandedItinerary = finalTrip.itinerary.map((day, dIdx) => {
      return {
        ...day,
        places: day.places.map((item, pIdx) => {
          // Deterministic jitter based on city name + day + place index
          const seed = `${city}-${dIdx}-${pIdx}`;
          const latOffset = (getPseudoRandom(seed + "-lat") - 0.5) * 0.02;
          const lngOffset = (getPseudoRandom(seed + "-lng") - 0.5) * 0.02;
          return {
            ...item,
            name: item.name.replace(new RegExp(templateCityName, "gi"), city),
            reason: item.reason.replace(new RegExp(templateCityName, "gi"), city),
            lat: cityCoords ? cityCoords.lat + latOffset : item.lat,
            lng: cityCoords ? cityCoords.lng + lngOffset : item.lng,
          };
        }),
      };
    });
    const cityVibe = activeCountry.cityVibes?.[city] || finalTrip.vibe;
    const cityEnergy = activeCountry.cityEnergy?.[city] || finalTrip.energyLevel;
    // AI Match Score deterministic based on city + country
    const seedForMatch = `${activeCountry.name}-${city}`;
    const aiMatchScore =
      (95 + (city.length % 4) + getPseudoRandom(seedForMatch) * 0.8).toFixed(1) + "%";
    const baseNightly = activeCountry.cityBasePrice?.[city] || 120;
    const numDays = finalTrip.days || 4;
    const numPlaces = rebrandedItinerary.reduce((acc, d) => acc + d.places.length, 0);
    // Deterministic prices
    const jitter = (s: string) => 0.95 + getPseudoRandom(s) * 0.1;
    const hotelCost = Math.round(baseNightly * numDays * jitter(city + "-hotel"));
    const activityCost = Math.round(numPlaces * 35 * jitter(city + "-act"));
    const foodCost = Math.round(numDays * 55 * jitter(city + "-food"));
    const totalPirce = hotelCost + activityCost + foodCost;
    const discoveryId = `discovery-${activeCountry.name}-${city}`
      .toLowerCase()
      .replace(/\s+/g, "-");
    return {
      ...finalTrip,
      id: discoveryId,
      title: city,
      image: cityImage,
      description: `A bespoke AI journey through ${city}, ${activeCountry.name}. Immerse yourself in the unique soul, local flavors, and hidden architectural gems of this iconic destination.`,
      itinerary: rebrandedItinerary,
      weather: weatherData,
      showWeather: !skipWeather,
      vibe: cityVibe,
      energyLevel: cityEnergy,
      aiMatch: aiMatchScore,
      price: totalPirce,
      days: numDays,
      places: numPlaces,
      priceBreakdown: {
        hotel: hotelCost,
        activities: activityCost,
        food: foodCost,
      },
    };
  } else {
    return { ...finalTrip, showWeather: false };
  }
}
