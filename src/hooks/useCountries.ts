"use client";

import { useQuery } from "@tanstack/react-query";

export interface Country {
  name: string;
  trips: string;
  cities: string[];
  image: string;
  description: string;
  cityCoords?: Record<string, { lat: number; lng: number }>;
  cityImages?: Record<string, string>;
  cityVibes?: Record<string, string>;
  cityEnergy?: Record<string, "Chilled" | "Moderate" | "High">;
  cityBasePrice?: Record<string, number>;
}

const COUNTRY_METADATA: Record<
  string,
  {
    image: string;
    description: string;
    popularCities: string[];
    cityCoords: Record<string, { lat: number; lng: number }>;
    cityImages: Record<string, string>;
    cityVibes: Record<string, string>;
    cityEnergy: Record<string, "Chilled" | "Moderate" | "High">;
    cityBasePrice: Record<string, number>;
  }
> = {
  Poland: {
    image: "/images/trip-warsaw.png",
    description:
      "Vibrant cities meet untouched nature in the heart of Europe. Experience rich history and modern dynamics.",
    popularCities: ["Warsaw", "Krakow", "Gdansk", "Wroclaw", "Zakopane", "Poznan"],
    cityCoords: {
      Warsaw: { lat: 52.2297, lng: 21.0122 },
      Krakow: { lat: 50.0647, lng: 19.945 },
      Gdansk: { lat: 54.352, lng: 18.6466 },
      Wroclaw: { lat: 51.1079, lng: 17.0385 },
      Zakopane: { lat: 49.2992, lng: 19.9493 },
      Poznan: { lat: 52.4064, lng: 16.9252 },
    },
    cityImages: {
      Warsaw: "/images/Warszawa.jpg",
      Krakow: "/images/Krakow.webp",
      Gdansk: "/images/Gdansk.jpg",
      Wroclaw: "/images/Wroclaw.avif",
      Zakopane: "/images/Zakopane.jpg",
      Poznan: "/images/Poznan.jpg",
    },
    cityVibes: {
      Warsaw: "Modern & Dynamic",
      Krakow: "Historical & Royal",
      Gdansk: "Maritime & Hanseatic",
      Wroclaw: "Academic & Bridges",
      Zakopane: "Alpine & Folklore",
      Poznan: "Trade & Renaissance",
    },
    cityEnergy: {
      Warsaw: "Moderate",
      Krakow: "Chilled",
      Gdansk: "Moderate",
      Wroclaw: "Moderate",
      Zakopane: "Chilled",
      Poznan: "Moderate",
    },
    cityBasePrice: {
      Warsaw: 95,
      Krakow: 85,
      Gdansk: 90,
      Wroclaw: 80,
      Zakopane: 110,
      Poznan: 75,
    },
  },
  Japan: {
    image: "/images/trip-tokyo.png",
    description:
      "Where ancient tradition dances with the neon future. Discover a world of precision, beauty, and taste.",
    popularCities: ["Tokyo", "Kyoto", "Osaka", "Nara", "Hiroshima", "Fukuoka"],
    cityCoords: {
      Tokyo: { lat: 35.6762, lng: 139.6503 },
      Kyoto: { lat: 35.0116, lng: 135.7681 },
      Osaka: { lat: 34.6937, lng: 135.5023 },
      Nara: { lat: 34.6851, lng: 135.8048 },
      Hiroshima: { lat: 34.3853, lng: 132.4553 },
      Fukuoka: { lat: 33.5904, lng: 130.4017 },
    },
    cityImages: {
      Tokyo: "/images/Tokyo.webp",
      Kyoto: "/images/Kyoto.jpg",
      Osaka: "/images/Osaka.jpg",
      Nara: "/images/Nara.webp",
      Hiroshima: "/images/Hiroshima.jpg",
      Fukuoka: "/images/Fukuoka.webp",
    },
    cityVibes: {
      Tokyo: "Neon & Cyberpunk",
      Kyoto: "Zen & Timeless",
      Osaka: "Vibrant & Street-Food",
      Nara: "Sacred & Peaceful",
      Hiroshima: "Reflective & Reborn",
      Fukuoka: "Ramen & Relaxed",
    },
    cityEnergy: {
      Tokyo: "High",
      Kyoto: "Chilled",
      Osaka: "High",
      Nara: "Chilled",
      Hiroshima: "Moderate",
      Fukuoka: "Moderate",
    },
    cityBasePrice: {
      Tokyo: 195,
      Kyoto: 175,
      Osaka: 160,
      Nara: 140,
      Hiroshima: 130,
      Fukuoka: 120,
    },
  },
  Brazil: {
    image: "/images/RioDeJaneiro.webp",
    description:
      "Tropical rhythm, lush rainforests, and golden shores. Feel the passion and energy of South America.",
    popularCities: ["Rio de Janeiro", "São Paulo", "Salvador", "Manaus", "Recife"],
    cityCoords: {
      "Rio de Janeiro": { lat: -22.9068, lng: -43.1729 },
      "São Paulo": { lat: -23.5505, lng: -46.6333 },
      Salvador: { lat: -12.9777, lng: -38.5016 },
      Manaus: { lat: -3.119, lng: -60.0217 },
      Recife: { lat: -8.0578, lng: -34.8778 },
    },
    cityImages: {
      "Rio de Janeiro": "/images/RioDeJaneiro.webp",
      "São Paulo": "/images/SaoPaulo.jpg",
      Salvador: "/images/Salvador.jpg",
      Manaus: "/images/Manaus.jpg",
      Recife: "/images/Recife.jpg",
    },
    cityVibes: {
      "Rio de Janeiro": "Samba & Scenic",
      "São Paulo": "Urban & Culinary",
      Salvador: "Afro-Brazilian & Soul",
      Manaus: "Amazonian & Grand",
      Recife: "Coastal & Historic",
    },
    cityEnergy: {
      "Rio de Janeiro": "High",
      "São Paulo": "High",
      Salvador: "Moderate",
      Manaus: "Chilled",
      Recife: "Moderate",
    },
    cityBasePrice: {
      "Rio de Janeiro": 145,
      "São Paulo": 135,
      Salvador: 95,
      Manaus: 110,
      Recife: 85,
    },
  },
  Germany: {
    image: "/images/trip-berlin.png",
    description:
      "Dynamic culture, storied history, and engineering marvels. Explore the artistic soul of Central Europe.",
    popularCities: ["Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt"],
    cityCoords: {
      Berlin: { lat: 52.52, lng: 13.405 },
      Munich: { lat: 48.1351, lng: 11.582 },
      Hamburg: { lat: 53.5511, lng: 9.9937 },
      Cologne: { lat: 50.9375, lng: 6.9603 },
      Frankfurt: { lat: 50.1109, lng: 8.6821 },
    },
    cityImages: {
      Berlin: "/images/Berlin.jpg",
      Munich: "/images/Munich.jpg",
      Hamburg: "/images/Hamburg.jpg",
      Cologne: "/images/Cologne.webp",
      Frankfurt: "/images/Frankfurt.jpg",
    },
    cityVibes: {
      Berlin: "Raw & Techno",
      Munich: "Bavarian & Clean",
      Hamburg: "Industrial & Port",
      Cologne: "Gothic & Kind",
      Frankfurt: "Metropolitan & Finance",
    },
    cityEnergy: {
      Berlin: "High",
      Munich: "Moderate",
      Hamburg: "Moderate",
      Cologne: "Moderate",
      Frankfurt: "High",
    },
    cityBasePrice: {
      Berlin: 155,
      Munich: 165,
      Hamburg: 145,
      Cologne: 130,
      Frankfurt: 180,
    },
  },
  Thailand: {
    image: "/images/Bangkok.webp",
    description:
      "The land of smiles, crystal waters, and golden temples. A sensory journey through paradise.",
    popularCities: ["Bangkok", "Phuket", "Chiang Mai", "Pattaya", "Krabi"],
    cityCoords: {
      Bangkok: { lat: 13.7563, lng: 100.5018 },
      Phuket: { lat: 7.8804, lng: 98.3923 },
      "Chiang Mai": { lat: 18.7883, lng: 98.9853 },
      Pattaya: { lat: 12.9236, lng: 100.8825 },
      Krabi: { lat: 8.0863, lng: 98.9063 },
    },
    cityImages: {
      Bangkok: "/images/Bangkok.webp",
      Phuket: "/images/Phuket.jpg",
      "Chiang Mai": "/images/Chiang Mai.jpg",
      Pattaya: "/images/Pattaya.webp",
      Krabi: "/images/Krabi.webp",
    },
    cityVibes: {
      Bangkok: "Vibrant City",
      Phuket: "Island Bliss",
      "Chiang Mai": "Cultural & Calm",
      Pattaya: "Neon & Sea",
      Krabi: "Limestone Nature",
    },
    cityEnergy: {
      Bangkok: "High",
      Phuket: "Moderate",
      "Chiang Mai": "Chilled",
      Pattaya: "High",
      Krabi: "Chilled",
    },
    cityBasePrice: {
      Bangkok: 110,
      Phuket: 135,
      "Chiang Mai": 75,
      Pattaya: 95,
      Krabi: 105,
    },
  },
  Spain: {
    image: "/images/trip-madrid.png",
    description:
      "Passion, sun-drenched plazas, and architectural masterpieces. Immerse yourself in the Mediterranean soul.",
    popularCities: ["Madrid", "Barcelona", "Seville", "Valencia", "Ibiza", "Malaga"],
    cityCoords: {
      Madrid: { lat: 40.4168, lng: -3.7038 },
      Barcelona: { lat: 41.3851, lng: 2.1734 },
      Seville: { lat: 37.3891, lng: -5.9845 },
      Valencia: { lat: 39.4699, lng: -0.3763 },
      Ibiza: { lat: 38.9067, lng: 1.4206 },
      Malaga: { lat: 36.7212, lng: -4.4214 },
    },
    cityImages: {
      Madrid: "/images/Madryt.jpg",
      Barcelona: "/images/Barcelona.jpg",
      Seville: "/images/Sevile.webp",
      Valencia: "/images/Valencia.webp",
      Ibiza: "/images/Ibiza.jpg",
      Malaga: "/images/Malaga.webp",
    },
    cityVibes: {
      Madrid: "Social & Sunny",
      Barcelona: "Artistic & Sea",
      Seville: "Flamenco & Old-World",
      Valencia: "Futuristic & Paella",
      Ibiza: "Vibrant & Hippie",
      Malaga: "Mediterranean & Coastal",
    },
    cityEnergy: {
      Madrid: "Moderate",
      Barcelona: "Moderate",
      Seville: "Chilled",
      Valencia: "Moderate",
      Ibiza: "High",
      Malaga: "Chilled",
    },
    cityBasePrice: {
      Madrid: 145,
      Barcelona: 185,
      Seville: 125,
      Valencia: 130,
      Ibiza: 245,
      Malaga: 115,
    },
  },
};

export const useCountries = () => {
  const query = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const res = await fetch("https://countriesnow.space/api/v0.1/countries");
      const json = await res.json();

      if (!json || json.error || !json.data) {
        throw new Error("Failed to fetch countries");
      }

      const targetCountries = ["Poland", "Japan", "Brazil", "Germany", "Thailand", "Spain"];

      return targetCountries.map((name) => {
        const found = json.data.find((c: any) => c.country === name);
        const meta = COUNTRY_METADATA[name];

        let cities = meta.popularCities;
        if (cities.length < 3 && found?.cities) {
          cities = [...cities, ...found.cities.slice(0, 8 - cities.length)];
        }

        const trips = Math.floor(Math.random() * 30000 + 500).toString();

        return {
          name,
          trips,
          cities,
          ...meta,
        } as Country;
      });
    },
    staleTime: 1000 * 60 * 60 * 24, // Lista krajów zmienia się rzadko, cache na 24h
  });

  return {
    countries: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
