import { useState, useEffect, useCallback } from "react";
import * as API from "../api/trips";
import { Trip } from "../types";
export function useUserTrips(userId?: string) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchTrips = useCallback(async () => {
    if (!userId) {
      setTrips([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await API.getUserTrips(userId);
      setTrips(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching user trips:", err);
      setError("Failed to load trips.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);
  return {
    trips,
    isLoading,
    error,
    refresh: fetchTrips,
  };
}
