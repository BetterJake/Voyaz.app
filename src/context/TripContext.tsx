"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTrips } from "@/hooks/useTrips";
import { useAuth } from "./AuthContext";
import { useMutation } from "@tanstack/react-query";

interface Destination {
  id: number;
  name: string;
  days: number;
  isValid: boolean;
  isValidating: boolean;
  error?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  hidden?: boolean;
  isJson?: boolean;
  raw?: any;
  isError?: boolean;
}

export interface ActiveTripSnapshot {
  id: string;
  title: string;
  itinerary: any[];
  days?: number;
  places?: number;
  energyLevel?: string;
  image?: string;
  vibe?: string;
  description?: string;
  price?: number;
}

interface TripContextType {
  step: number;
  destinations: Destination[];
  tripDetails: {
    dateFrom: string;
    dateTo: string;
    budget: string;
    mustSee: string;
    description: string;
  };
  messages: Message[];
  isLoading: boolean;
  currentPlan: any;
  selectedDayId: number | null;
  editingPlace: { dayId: number; placeIdx: number } | null;
  inputValue: string;
  activeTripId: string | null;
  activeTrip: ActiveTripSnapshot | null;
  savedTripId: string | null;
  setStep: (step: number) => void;
  setDestinations: React.Dispatch<React.SetStateAction<Destination[]>>;
  setInputValue: (val: string) => void;
  setEditingPlace: (val: { dayId: number; placeIdx: number } | null) => void;
  setSelectedDayId: (id: number | null) => void;
  setActiveTrip: (id: string | null, trip?: ActiveTripSnapshot | null) => void;
  setSavedTripId: (id: string | null) => void;
  toggleTracking: (idOrTrip: string | number | ActiveTripSnapshot) => void;
  isTracking: (id: string | number) => boolean;
  addDestination: () => void;
  removeDestination: (id: number) => void;
  updateDestinationName: (id: number, name: string) => void;
  handleDaysChange: (id: number, delta: number) => void;
  validateCity: (id: number, name: string) => void;
  setTripDetails: React.Dispatch<React.SetStateAction<TripContextType["tripDetails"]>>;
  updatePlace: (dayId: number, placeIdx: number, updates: any) => void;
  addPlace: (dayId: number, place: any) => void;
  removePlace: (dayId: number, placeIdx: number) => void;
  reorderPlace: (dayId: number, placeIdx: number, direction: "up" | "down") => void;
  movePlaceToDay: (fromDayId: number, placeIdx: number, toDayId: number) => void;
  reorderPlaces: (dayId: number, newPlaces: any[]) => void;
  addDay: (afterDayId?: number) => void;
  removeDay: (dayId: number) => void;
  updateDayTheme: (dayId: number, theme: string) => void;
  sendMessage: (message: { role: string; content: string; hidden?: boolean }) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  startChat: () => void;
  setCurrentPlan: (plan: any) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  plannedDays: number;
  totalTripDays: number;
  isDaysMatch: boolean;
  allCitiesValid: boolean;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

const ACTIVE_TRIP_ID_KEY = "activeTripId";
const ACTIVE_TRIP_DATA_KEY = "voyaz_active_trip_data";

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [destinations, setDestinations] = useState<Destination[]>([
    { id: 1, name: "Cracow", days: 2, isValid: true, isValidating: false },
    { id: 2, name: "Wroclaw", days: 2, isValid: true, isValidating: false },
    { id: 3, name: "Berlin", days: 3, isValid: true, isValidating: false },
  ]);
  const [tripDetails, setTripDetails] = useState({
    dateFrom: new Date().toISOString().split("T")[0],
    dateTo: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    budget: "2500",
    mustSee: "",
    description: "",
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
  const [editingPlace, setEditingPlace] = useState<{ dayId: number; placeIdx: number } | null>(
    null
  );
  const [inputValue, setInputValue] = useState("");
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [activeTrip, setActiveTripState] = useState<ActiveTripSnapshot | null>(null);
  const [savedTripId, setSavedTripId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = localStorage.getItem(ACTIVE_TRIP_ID_KEY);
    if (id) setActiveTripId(id);
    const raw = localStorage.getItem(ACTIVE_TRIP_DATA_KEY);
    if (raw) {
      try {
        setActiveTripState(JSON.parse(raw));
      } catch {
        localStorage.removeItem(ACTIVE_TRIP_DATA_KEY);
      }
    }
  }, []);

  const setActiveTrip = (id: string | null, trip?: ActiveTripSnapshot | null) => {
    setActiveTripId(id);
    if (typeof window === "undefined") return;
    if (id) {
      localStorage.setItem(ACTIVE_TRIP_ID_KEY, id);
      if (trip) {
        const snapshot: ActiveTripSnapshot = { ...trip, id };
        localStorage.setItem(ACTIVE_TRIP_DATA_KEY, JSON.stringify(snapshot));
        setActiveTripState(snapshot);
      }
    } else {
      localStorage.removeItem(ACTIVE_TRIP_ID_KEY);
      localStorage.removeItem(ACTIVE_TRIP_DATA_KEY);
      setActiveTripState(null);
    }
  };

  const toggleTracking = (idOrTrip: string | number | ActiveTripSnapshot) => {
    if (typeof idOrTrip === "string" || typeof idOrTrip === "number") {
      const stringId = String(idOrTrip);
      if (activeTripId === stringId) setActiveTrip(null);
      else setActiveTrip(stringId);
      return;
    }
    const snapshot = idOrTrip;
    const stringId = String(snapshot.id);
    if (activeTripId === stringId) setActiveTrip(null);
    else setActiveTrip(stringId, snapshot);
  };

  const isTracking = (id: string | number) => activeTripId === String(id);

  const searchParams = useSearchParams();
  const { trips } = useTrips();

  const calculateTotalTripDays = () => {
    const start = new Date(tripDetails.dateFrom);
    const end = new Date(tripDetails.dateTo);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)) + 1);
  };

  const addDaysToDate = (dateStr: string, days: number) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days - 1);
    return d.toISOString().split("T")[0];
  };

  const plannedDays = destinations.reduce((sum, d) => sum + d.days, 0);
  const totalTripDays = calculateTotalTripDays();
  const isDaysMatch = totalTripDays === plannedDays;
  const allCitiesValid = destinations.every((d) => d.isValid && d.name.length > 2);

  // Sync dateTo with destinations total days whenever destinations or dateFrom changes
  useEffect(() => {
    const totalDays = destinations.reduce((sum, d) => sum + d.days, 0);
    setTripDetails((prev) => ({
      ...prev,
      dateTo: addDaysToDate(prev.dateFrom, totalDays),
    }));
  }, [destinations, tripDetails.dateFrom]);

  useEffect(() => {
    const tripId = searchParams.get("tripId");
    const destParam = searchParams.get("destination");
    const daysParam = searchParams.get("days");
    const budgetParam = searchParams.get("budget");
    if (tripId !== null && trips.length > 0) {
      const trip = trips.find((t) => String(t.id) === tripId);
      if (trip) {
        setDestinations([
          { id: 1, name: trip.title, days: trip.days, isValid: true, isValidating: false },
        ]);
        setTripDetails((prev) => ({ ...prev, description: trip.description }));
        setStep(3);
        setSelectedDayId(1);
      }
    } else if (destParam || daysParam || budgetParam) {
      const initialDays = daysParam ? Math.min(parseInt(daysParam), 7) : 3;
      if (destParam) {
        setDestinations([
          { id: 1, name: destParam, days: initialDays, isValid: false, isValidating: false },
        ]);
        // Trigger validation for the initial destination
        setTimeout(() => validateCity(1, destParam), 100);
      }
      setTripDetails((prev) => ({
        ...prev,
        budget: budgetParam || prev.budget,
        dateTo: addDaysToDate(prev.dateFrom, initialDays),
      }));
    }
  }, [trips, searchParams]);

  // Keep active trip cache fresh if the underlying trip data changes
  useEffect(() => {
    if (!activeTripId || trips.length === 0) return;
    const match = trips.find((t) => String(t.id) === activeTripId);
    if (!match) return;
    const snapshot: ActiveTripSnapshot = {
      id: String(match.id),
      title: match.title,
      itinerary: match.itinerary,
      days: match.days,
      places: match.places,
      energyLevel: match.energyLevel,
      image: match.image,
      vibe: match.vibe,
      description: match.description,
      price: match.price,
    };
    const prev = activeTrip ? JSON.stringify(activeTrip) : "";
    const next = JSON.stringify(snapshot);
    if (prev !== next) {
      setActiveTripState(snapshot);
      if (typeof window !== "undefined") {
        localStorage.setItem(ACTIVE_TRIP_DATA_KEY, next);
      }
    }
  }, [activeTripId, trips, activeTrip]);

  const validateCityMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const res = await fetch("/api/validate-city", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: name }),
      });
      if (!res.ok) throw new Error("Validation failed");
      return res.json();
    },
    onMutate: ({ id }) => {
      setDestinations((prev) => prev.map((d) => (d.id === id ? { ...d, isValidating: true } : d)));
    },
    onSuccess: (data, { id }) => {
      setDestinations((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                isValid: data.valid,
                isValidating: false,
                name: data.valid ? data.name : d.name,
                error: data.error,
              }
            : d
        )
      );
    },
    onError: (error, { id }) => {
      setDestinations((prev) =>
        prev.map((d) => (d.id === id ? { ...d, isValidating: false, isValid: false } : d))
      );
    },
  });

  const validateCity = (id: number, name: string) => {
    if (name.length < 3) {
      setDestinations((prev) =>
        prev.map((d) => (d.id === id ? { ...d, isValid: false, isValidating: false } : d))
      );
      return;
    }
    validateCityMutation.mutate({ id, name });
  };

  const updateDestinationName = (id: number, name: string) => {
    setDestinations((prev) => prev.map((d) => (d.id === id ? { ...d, name, isValid: false } : d)));
  };

  const handleDaysChange = (id: number, delta: number) => {
    const currentTotal = destinations.reduce((sum, d) => sum + d.days, 0);
    if (delta > 0 && currentTotal >= 7) return;

    const newDests = destinations.map((d) =>
      d.id === id ? { ...d, days: Math.max(1, d.days + delta) } : d
    );
    setDestinations(newDests);
    const newTotalDays = newDests.reduce((sum, d) => sum + d.days, 0);
    setTripDetails((prev) => ({ ...prev, dateTo: addDaysToDate(prev.dateFrom, newTotalDays) }));
  };

  const addDestination = () => {
    const currentTotal = destinations.reduce((sum, d) => sum + d.days, 0);
    if (currentTotal >= 7) return;

    const newId = destinations.length > 0 ? Math.max(...destinations.map((d) => d.id)) + 1 : 1;
    setDestinations((prev) => [
      ...prev,
      { id: newId, name: "", days: 1, isValid: false, isValidating: false },
    ]);
  };

  const removeDestination = (id: number) => {
    if (destinations.length > 1) {
      setDestinations((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const updatePlace = (dayId: number, placeIdx: number, updates: any) => {
    console.log(`[TripContext] updatePlace Day ${dayId}, Index ${placeIdx}:`, updates);
    setCurrentPlan((prev: any) => {
      if (!prev) return prev;
      const newItinerary = [...prev.itinerary];
      const dayIdx = newItinerary.findIndex((d: any) => d.day === dayId);
      if (dayIdx === -1) return prev;

      const newPlaces = [...newItinerary[dayIdx].places];
      newPlaces[placeIdx] = { ...newPlaces[placeIdx], ...updates };
      newItinerary[dayIdx] = { ...newItinerary[dayIdx], places: newPlaces };

      const newPlan = { ...prev, itinerary: newItinerary };
      console.log("[TripContext] Plan state updated with new coordinates.");
      return newPlan;
    });
  };

  const addPlace = (dayId: number, place: any) => {
    if (!currentPlan) return;
    const newItinerary = currentPlan.itinerary.map((day: any) => {
      if (day.day !== dayId) return day;
      return { ...day, places: [...(day.places || []), place] };
    });
    setCurrentPlan({ ...currentPlan, itinerary: newItinerary });
  };

  const removePlace = (dayId: number, placeIdx: number) => {
    if (!currentPlan) return;
    const newItinerary = currentPlan.itinerary.map((day: any) => {
      if (day.day !== dayId) return day;
      return {
        ...day,
        places: day.places.filter((_: any, i: number) => i !== placeIdx),
      };
    });
    setCurrentPlan({ ...currentPlan, itinerary: newItinerary });
  };

  const reorderPlace = (dayId: number, placeIdx: number, direction: "up" | "down") => {
    if (!currentPlan) return;
    const newItinerary = [...currentPlan.itinerary];
    const dayIdx = newItinerary.findIndex((d: any) => d.day === dayId);
    if (dayIdx === -1) return;

    const places = [...newItinerary[dayIdx].places];
    if (direction === "up" && placeIdx > 0) {
      [places[placeIdx - 1], places[placeIdx]] = [places[placeIdx], places[placeIdx - 1]];
    } else if (direction === "down" && placeIdx < places.length - 1) {
      [places[placeIdx], places[placeIdx + 1]] = [places[placeIdx + 1], places[placeIdx]];
    } else {
      return;
    }

    newItinerary[dayIdx] = { ...newItinerary[dayIdx], places };
    setCurrentPlan({ ...currentPlan, itinerary: newItinerary });
  };

  const movePlaceToDay = (fromDayId: number, placeIdx: number, toDayId: number) => {
    if (!currentPlan || fromDayId === toDayId) return;
    const newItinerary = [...currentPlan.itinerary];
    const fromDayIdx = newItinerary.findIndex((d: any) => d.day === fromDayId);
    const toDayIdx = newItinerary.findIndex((d: any) => d.day === toDayId);
    if (fromDayIdx === -1 || toDayIdx === -1) return;
    const placeToMove = newItinerary[fromDayIdx].places[placeIdx];
    const newFromPlaces = newItinerary[fromDayIdx].places.filter(
      (_: any, i: number) => i !== placeIdx
    );
    const newToPlaces = [...(newItinerary[toDayIdx].places || []), placeToMove];
    newItinerary[fromDayIdx] = { ...newItinerary[fromDayIdx], places: newFromPlaces };
    newItinerary[toDayIdx] = { ...newItinerary[toDayIdx], places: newToPlaces };
    setCurrentPlan({ ...currentPlan, itinerary: newItinerary });
  };

  const reorderPlaces = (dayId: number, newPlaces: any[]) => {
    if (!currentPlan) return;
    const newItinerary = currentPlan.itinerary.map((day: any) =>
      day.day === dayId ? { ...day, places: newPlaces } : day
    );
    setCurrentPlan({ ...currentPlan, itinerary: newItinerary });
  };

  const addDay = (afterDayId?: number) => {
    if (!currentPlan) return;
    if (currentPlan.itinerary.length >= 7) return;

    const itinerary = [...currentPlan.itinerary];
    const insertAfterIdx =
      afterDayId !== undefined
        ? itinerary.findIndex((d: any) => d.day === afterDayId)
        : itinerary.length - 1;
    const newDayNumber =
      (insertAfterIdx >= 0 ? itinerary[insertAfterIdx].day : itinerary.length) + 1;
    const newDay = { day: newDayNumber, theme: "Free Day", places: [] };
    const newItinerary = [
      ...itinerary.slice(0, insertAfterIdx + 1),
      newDay,
      ...itinerary.slice(insertAfterIdx + 1).map((d: any) => ({ ...d, day: d.day + 1 })),
    ];
    setCurrentPlan({ ...currentPlan, itinerary: newItinerary });
  };

  const removeDay = (dayId: number) => {
    if (!currentPlan || currentPlan.itinerary.length <= 1) return;
    const filtered = currentPlan.itinerary.filter((d: any) => d.day !== dayId);
    const renumbered = filtered.map((d: any, i: number) => ({ ...d, day: i + 1 }));
    setCurrentPlan({ ...currentPlan, itinerary: renumbered });
  };

  const updateDayTheme = (dayId: number, theme: string) => {
    if (!currentPlan) return;
    const newItinerary = currentPlan.itinerary.map((day: any) =>
      day.day === dayId ? { ...day, theme } : day
    );
    setCurrentPlan({ ...currentPlan, itinerary: newItinerary });
  };

  const sendMessage = async (message: { role: string; content: string; hidden?: boolean }) => {
    setIsLoading(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: message.role as any,
      content: message.content,
      hidden: message.hidden,
    };

    // When a plan already exists and this is a user refinement request,
    // inject the current plan as hidden context so AI knows what to modify.
    let contextMessages = [...messages];
    if (currentPlan && !message.hidden) {
      // Remove any stale plan context from previous refinements
      const withoutOldContext = contextMessages.filter(
        (m) => !m.content?.startsWith("CURRENT_PLAN_CONTEXT:") && m.id !== "plan-context-ack"
      );
      const planContext: Message = {
        id: "plan-context",
        role: "user",
        content: `CURRENT_PLAN_CONTEXT: ${JSON.stringify({
          destination: currentPlan.destination,
          summary: currentPlan.summary,
          vibe: currentPlan.vibe,
          energy_level: currentPlan.energy_level,
          itinerary: currentPlan.itinerary,
          category: currentPlan.category,
        })}`,
        hidden: true,
      };
      const planAck: Message = {
        id: "plan-context-ack",
        role: "assistant",
        content: `MODIFICATION_MODE: I have the current plan loaded for ${currentPlan.destination}. I will ONLY modify what is explicitly requested and preserve everything else exactly.`,
        hidden: true,
      };
      contextMessages = [...withoutOldContext, planContext, planAck];
    }

    const updatedMessages = [...contextMessages, userMessage];

    // Only add the visible user message to displayed messages
    setMessages((prev) => [
      ...prev.filter(
        (m) => !m.content?.startsWith("CURRENT_PLAN_CONTEXT:") && m.id !== "plan-context-ack"
      ),
      userMessage,
    ]);

    try {
      const userPreferences = {
        travel_style: profile?.travel_style,
        pace_of_travel: profile?.pace_of_travel,
        budget: tripDetails.budget,
        preferred_currency: profile?.preferred_currency || "PLN",
        parking_required: (tripDetails as any).parkingRequired,
        distance_unit: profile?.distance_unit,
        temperature_unit: profile?.temperature_unit,
        is_refinement: !!currentPlan && !message.hidden,
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(({ role, content }) => ({ role, content })),
          userPreferences,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const serverError = errorData.error || `Server returned ${response.status}`;
        throw new Error(serverError);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: data.chat_message || "I've updated your plan!",
          isJson: true,
          raw: data,
        },
      ]);

      if (data.trip_plan) {
        console.log("[TripContext] Received trip_plan from API:", data.trip_plan.destination);
        setCurrentPlan(data.trip_plan);
        if (data.trip_plan.itinerary?.length > 0) {
          setSelectedDayId(data.trip_plan.itinerary[0].day);
        }
      }
    } catch (err: any) {
      console.error("Voyaz Chat Context Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `Error: ${err.message || "Failed to generate voyage. Please try again."}`,
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const retryLastMessage = async () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      // Remove the error message first
      setMessages((prev) => prev.filter((m) => !m.isError));
      await sendMessage({
        role: lastUserMessage.role,
        content: lastUserMessage.content,
        hidden: lastUserMessage.hidden,
      });
    }
  };

  const startChat = () => {
    setStep(3);
    const userContext = profile
      ? `
    User Preferences:
    - Travel Style: ${profile.travel_style || "Not specified"}
    - Pace: ${profile.pace_of_travel || "Moderate"}
    - Preferred Currency: ${profile.preferred_currency || "USD ($)"}
    - Dietary: ${profile.dietary_restrictions || "None"}
    - Companions: ${profile.travel_companions || "Solo"}
    `
      : "";

    // Explicitly define city allocation to avoid AI confusion
    const cityAllocation = destinations.map((d) => `- ${d.name}: ${d.days} days`).join("\n");

    const preferredCurrency = profile?.preferred_currency || "USD ($)";
    const currencyCode = preferredCurrency.split(" ")[0];

    const prompt = `Create a trip plan with the following strict city allocation:
    ${cityAllocation}
    
    Total Dates: ${tripDetails.dateFrom} to ${tripDetails.dateTo}.
    Budget: ${tripDetails.budget} ${currencyCode}/person.
    ${userContext}
    Notes: ${tripDetails.description || "none"}
    Must see: ${tripDetails.mustSee || "none"}
    
    IMPORTANT: You MUST follow the city allocation exactly. For example, if Katowice has 3 days, Day 1, 2, and 3 MUST be in Katowice. Provide all prices and costs in ${preferredCurrency}.`;

    sendMessage({ role: "user", content: prompt, hidden: true });
  };

  return (
    <TripContext.Provider
      value={{
        step,
        destinations,
        tripDetails,
        messages,
        isLoading,
        currentPlan,
        selectedDayId,
        editingPlace,
        inputValue,
        activeTripId,
        activeTrip,
        savedTripId,
        setStep,
        setDestinations,
        setInputValue,
        setEditingPlace,
        setSelectedDayId,
        setActiveTrip,
        setSavedTripId,
        toggleTracking,
        isTracking,
        addDestination,
        removeDestination,
        updateDestinationName,
        handleDaysChange,
        validateCity,
        setTripDetails,
        updatePlace,
        addPlace,
        removePlace,
        reorderPlace,
        movePlaceToDay,
        reorderPlaces,
        addDay,
        removeDay,
        updateDayTheme,
        sendMessage,
        retryLastMessage,
        startChat,
        setCurrentPlan,
        setMessages,
        plannedDays,
        totalTripDays,
        isDaysMatch,
        allCitiesValid,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) throw new Error("useTrip must be used within a TripProvider");
  return context;
};
