"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthContext";
type FavouriteId = string | number;
interface FavouritesContextType {
  favouriteIds: FavouriteId[];
  toggleFavourite: (id: FavouriteId) => Promise<void>;
  isFavourite: (id: FavouriteId) => boolean;
  isLoading: boolean;
}
const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);
export const FavouritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favouriteIds, setFavouriteIds] = useState<FavouriteId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();
  const isRealTripId = (id: FavouriteId) =>
    typeof id === "string" &&
    id.length === 36 &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const fetchFavourites = useCallback(async () => {
    const localSaved = localStorage.getItem("voyaz_favourites");
    let localIds: FavouriteId[] = [];
    if (localSaved) {
      try {
        localIds = JSON.parse(localSaved);
      } catch (e) {
        console.error("Failed to parse local favourites", e);
      }
    }
    if (!user) {
      setFavouriteIds(localIds);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("favourites")
        .select("trip_id")
        .eq("user_id", user.id);
      if (error) throw error;
      if (data) {
        const dbIds = data.map((f) => f.trip_id);
        const combined = Array.from(
          new Set([...dbIds, ...localIds.filter((id) => !isRealTripId(id))])
        );
        setFavouriteIds(combined);
        const unsyncedRealIds = localIds.filter(
          (id) => isRealTripId(id) && !dbIds.includes(id as string)
        );
        if (unsyncedRealIds.length > 0) {
          const inserts = unsyncedRealIds.map((id) => ({ user_id: user.id, trip_id: id }));
          await supabase.from("favourites").insert(inserts);
          const cleanedLocal = localIds.filter((id) => !isRealTripId(id));
          localStorage.setItem("voyaz_favourites", JSON.stringify(cleanedLocal));
        }
      }
    } catch (err) {
      console.error("Error fetching/merging favourites:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);
  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);
  useEffect(() => {
    const mockAndGuestIds = favouriteIds.filter((id) => !isRealTripId(id) || !user);
    localStorage.setItem("voyaz_favourites", JSON.stringify(mockAndGuestIds));
  }, [favouriteIds, user]);
  const toggleFavourite = async (id: FavouriteId) => {
    const isAdding = !favouriteIds.includes(id);
    const isReal = isRealTripId(id);
    setFavouriteIds((prev) => (isAdding ? [...prev, id] : prev.filter((fId) => fId !== id)));
    if (user && isReal) {
      try {
        if (isAdding) {
          await supabase.from("favourites").insert({ user_id: user.id, trip_id: id });
        } else {
          await supabase.from("favourites").delete().eq("user_id", user.id).eq("trip_id", id);
        }
      } catch (err) {
        console.error("Failed to sync favourite with DB:", err);
        fetchFavourites();
      }
    }
  };
  const isFavourite = (id: FavouriteId) => favouriteIds.includes(id);
  return (
    <FavouritesContext.Provider value={{ favouriteIds, toggleFavourite, isFavourite, isLoading }}>
      {children}
    </FavouritesContext.Provider>
  );
};
export const useFavourites = () => {
  const context = useContext(FavouritesContext);
  if (!context) throw new Error("useFavourites must be used within a FavouritesProvider");
  return context;
};
