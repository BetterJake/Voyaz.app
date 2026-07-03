import { useState } from "react";
import { Trip } from "@/hooks/useTrips";
import { Country } from "@/hooks/useCountries";
import { getPersonalizedTrip } from "@/utils/tripPersonalizer";
export function useTripPersonalizer() {
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const personalizeTrip = async (
    activeCountry: Country,
    selectedCity: string | null,
    trips: Trip[]
  ): Promise<Trip | null> => {
    setIsWeatherLoading(true);
    try {
      return await getPersonalizedTrip({ activeCountry, selectedCity, trips });
    } finally {
      setIsWeatherLoading(false);
    }
  };
  return { personalizeTrip, isWeatherLoading };
}
