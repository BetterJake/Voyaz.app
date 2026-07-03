"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Calendar,
  Minus,
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
  Send,
  Sparkles,
  Wallet,
  Compass,
  MessageSquare,
  MoreHorizontal,
  Home,
  Car,
  Save,
  Navigation,
  Power,
  Pencil,
  Brain,
  Globe,
  Search,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Footprints,
  CloudRain,
  Sun,
  Cloud,
  Thermometer,
} from "lucide-react";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTrip } from "@/context/TripContext";
import * as API from "@/features/trips/api/trips";
import { IoCheckmarkCircle } from "react-icons/io5";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center font-black text-gray-300 uppercase tracking-widest">
      LOADING MAP...
    </div>
  ),
});

import { usePreferences } from "@/context/PreferencesContext";

export default function PlanTripPage() {
  const { formatCurrency } = usePreferences();
  const {
    messages,
    isLoading,
    currentPlan,
    selectedDayId,
    setSelectedDayId,
    sendMessage,
    startChat,
    activeTripId,
    setActiveTrip,
    setCurrentPlan,
    setMessages,
    step,
    setStep,
    destinations,
    setDestinations,
    tripDetails,
    setTripDetails,
    updateDestinationName,
    validateCity,
    handleDaysChange,
    addDestination,
    plannedDays,
    totalTripDays,
    isDaysMatch,
    allCitiesValid,
    savedTripId,
    setSavedTripId,
    addPlace,
    removePlace,
    updatePlace,
    reorderPlace,
    movePlaceToDay,
    reorderPlaces,
    addDay,
    removeDay,
    updateDayTheme,
  } = useTrip() as any;

  const { user: currentUser } = useAuth();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Voyage Stored!");
  const [isSaving, setIsSaving] = useState(false);
  const isActive = !!savedTripId && activeTripId === savedTripId;

  // Place manager state
  const [addingToDayId, setAddingToDayId] = useState<number | null>(null);
  const [placeSearchQuery, setPlaceSearchQuery] = useState("");
  const [placeSearchResults, setPlaceSearchResults] = useState<any[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [expandedPlaceKey, setExpandedPlaceKey] = useState<string | null>(null); // 'dayId-placeIdx'
  const placeSearchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchPlaces = async (query: string, dayId: number) => {
    if (!query.trim()) {
      setPlaceSearchResults([]);
      return;
    }
    setIsSearchingPlaces(true);
    try {
      // Get a rough location center from the first place with coords in the current plan
      let location: { lat: number; lng: number } | undefined;
      const allPlaces = currentPlan?.itinerary?.flatMap((d: any) => d.places || []) || [];
      const firstGeo = allPlaces.find((p: any) => p.lat && p.lng);
      if (firstGeo) location = { lat: firstGeo.lat, lng: firstGeo.lng };

      const res = await fetch("/api/places/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, location }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setPlaceSearchResults(data.places || []);
    } catch (e) {
      console.error("[searchPlaces]", e);
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  const handleAddPlaceFromSearch = (dayId: number, googlePlace: any) => {
    const day = currentPlan?.itinerary?.find((d: any) => d.day === dayId);
    const existingPlaces = day?.places || [];
    // Calculate a sensible start time after the last place
    const lastPlace = existingPlaces[existingPlaces.length - 1];
    const startTime = lastPlace?.end_time || lastPlace?.start_time || "10:00";
    addPlace(dayId, {
      name: googlePlace.name,
      address: googlePlace.address,
      lat: googlePlace.lat,
      lng: googlePlace.lng,
      website_url: googlePlace.website_url,
      rating: googlePlace.rating,
      category: googlePlace.category,
      start_time: startTime,
      end_time: "",
      duration: 60,
      reason: "Added manually from Google Places.",
      average_price: 0,
    });
    setAddingToDayId(null);
    setPlaceSearchQuery("");
    setPlaceSearchResults([]);
  };

  // Banner editor state
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [showBannerEditor, setShowBannerEditor] = useState(false);
  const [bannerSearchQuery, setBannerSearchQuery] = useState("");
  const [bannerResults, setBannerResults] = useState<any[]>([]);
  const [isSearchingBanner, setIsSearchingBanner] = useState(false);

  // Trip editor state
  const [editMode, setEditMode] = useState(false);
  const [isLoadedFromUrl, setIsLoadedFromUrl] = useState(false); // true = opened via "Open AI Editor"
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editVibe, setEditVibe] = useState("");
  const [editEnergyLevel, setEditEnergyLevel] = useState<"Low" | "Moderate" | "High">("Moderate");
  const [editVisibility, setEditVisibility] = useState<"private" | "friends" | "public">("private");

  const searchBannerImages = async (query: string, autoSet = false) => {
    if (!query.trim()) return;
    setIsSearchingBanner(true);
    try {
      const res = await fetch(`/api/search-images?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      const results = data.results || [];
      setBannerResults(results);
      // If triggered automatically, set first result as default banner
      if (autoSet && results.length > 0 && !bannerUrl) {
        setBannerUrl(results[0].regular);
      }
    } catch {
      setBannerResults([]);
    } finally {
      setIsSearchingBanner(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-fetch banner when AI generates a plan
  useEffect(() => {
    if (!currentPlan?.destination || bannerUrl) return;
    const query = currentPlan.destination.split(",")[0].trim();
    searchBannerImages(query, true);
  }, [currentPlan?.destination]);

  // Initialize edit state when a plan is generated
  useEffect(() => {
    if (!currentPlan) return;
    setEditTitle((currentPlan as any).destination || "");
    setEditSummary((currentPlan as any).summary || "");
    setEditVibe((currentPlan as any).vibe || "");
    setEditEnergyLevel((currentPlan as any).energy_level || "Moderate");
  }, [currentPlan?.destination]);

  const handleBudgetChange = (val: string) => {
    // Limit to 7 digits (max 9,999,999) to prevent UI overflow and unrealistic budgets
    if ((val === "" || /^\d+$/.test(val)) && val.length <= 7) {
      setTripDetails({ ...tripDetails, budget: val });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage({ role: "user", content: inputValue });
    setInputValue("");
  };

  const handleActivate = () => {
    if (!savedTripId) return;
    if (isActive) {
      setActiveTrip(null);
      setToastMessage("Voyage Deactivated");
    } else {
      const snapshot = buildActiveSnapshot();
      if (!snapshot) return;
      setActiveTrip(savedTripId, snapshot);
      setToastMessage("Voyage Activated");
    }
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2500);
  };

  const buildActiveSnapshot = () => {
    if (!currentPlan || !savedTripId) return null;
    const itinerary = currentPlan.itinerary || [];
    const placesCount = itinerary.reduce(
      (acc: number, day: any) => acc + (day.places?.length || 0),
      0
    );
    return {
      id: savedTripId,
      title: currentPlan.destination || "New Adventure",
      itinerary,
      days: itinerary.length,
      places: placesCount,
      energyLevel: currentPlan.energy_level || currentPlan.energyLevel || "Moderate",
      image: "/images/generated-trips.png",
      vibe: currentPlan.vibe || tripDetails.description || "Custom",
      description: currentPlan.summary || "",
    };
  };

  useEffect(() => {
    const tripId = searchParams.get("tripId");
    if (!tripId) return;
    setSavedTripId(tripId);

    // Load the saved trip and restore currentPlan so we go straight to step 3
    const loadTrip = async () => {
      try {
        const res = await fetch(`/api/trips/get?id=${tripId}`);
        if (!res.ok) return;
        const { trip } = await res.json();
        if (!trip) return;

        const restoredPlan = {
          destination: trip.destination || trip.title || "",
          summary: trip.summary || trip.description || "",
          vibe: trip.vibe || "",
          energy_level: trip.energy_level || "Moderate",
          itinerary: trip.itinerary || [],
          category: trip.category || null,
        };

        // Reconstruct the currentPlan shape from the stored Trip record
        setCurrentPlan(restoredPlan as any);

        // Restore edit fields
        setEditTitle(trip.destination || trip.title || "");
        setEditSummary(trip.summary || trip.description || "");
        setEditVibe(trip.vibe || "");
        setEditEnergyLevel(trip.energy_level || "Moderate");
        setEditVisibility(trip.visibility || "private");
        if (trip.image_url) setBannerUrl(trip.image_url);

        // Inject synthetic chat history so Chat tab isn't empty
        const dayCount = (trip.itinerary || []).length;
        const placesCount = (trip.itinerary || []).reduce(
          (acc: number, d: any) => acc + (d.places?.length || 0),
          0
        );
        setMessages([
          {
            id: "trip-load-init",
            role: "user",
            content: `Load my saved trip: ${restoredPlan.destination}`,
            hidden: true,
          } as any,
          {
            id: "trip-load-ack",
            role: "assistant",
            content: `✈️ **${restoredPlan.destination}** restored and ready.\n\n${restoredPlan.summary}\n\n📅 ${dayCount} day${dayCount !== 1 ? "s" : ""} · 📍 ${placesCount} places${restoredPlan.vibe ? ` · ✨ ${restoredPlan.vibe}` : ""}\n\nYou can refine this voyage - ask me to change a hotel, swap a place, adjust the budget, or anything else.`,
          } as any,
        ]);

        // Jump to step 3 and open editor
        setIsLoadedFromUrl(true);
        setStep(3);
        setEditMode(true);
      } catch (e) {
        console.error("[loadTrip from URL]", e);
      }
    };

    loadTrip();
  }, [searchParams]);

  const handleSaveTrip = async () => {
    if (!currentUser || !currentPlan) return;
    setIsSaving(true);
    console.log("[handleSaveTrip] Starting save process...");
    try {
      // ── Case 1: Existing trip loaded from URL → UPDATE ──────────────────────
      if (savedTripId && editMode) {
        console.log("[handleSaveTrip] Updating existing trip:", savedTripId);
        const res = await fetch("/api/trips/update", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tripId: savedTripId,
            data: {
              title: editTitle || currentPlan.destination || "New Adventure",
              description: editSummary || currentPlan.summary || "",
              summary: editSummary || currentPlan.summary || "",
              destination: editTitle || currentPlan.destination || "",
              vibe: editVibe || (currentPlan as any).vibe || "",
              energy_level: editEnergyLevel,
              image_url: bannerUrl || undefined,
              visibility: editVisibility,
              category: (currentPlan as any).category,
              // Critical: send the full edited itinerary
              itinerary: currentPlan.itinerary || [],
              days: (currentPlan.itinerary || []).length,
              places_count: (currentPlan.itinerary || []).reduce(
                (acc: number, d: any) => acc + (d.places?.length || 0),
                0
              ),
              price_total: Math.round(
                (currentPlan.itinerary || []).reduce(
                  (acc: number, d: any) =>
                    acc +
                    (d.places || []).reduce(
                      (pAcc: number, p: any) => pAcc + (Number(p.average_price_pln) || 0),
                      0
                    ),
                  0
                )
              ),
            },
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Update failed");
        }
        setToastMessage("Voyage Updated!");
        setEditMode(false);

        // ── Case 2: New plan already saved → user wants to REMOVE it ───────────
      } else if (savedTripId && !editMode) {
        console.log("[handleSaveTrip] Removing trip:", savedTripId);
        await API.deleteTrip(savedTripId);
        if (activeTripId === savedTripId) setActiveTrip(null);
        setSavedTripId(null);
        setToastMessage("Voyage Removed");

        // ── Case 3: New plan, not yet saved → INSERT ────────────────────────────
      } else {
        const itinerary = currentPlan.itinerary || [];
        const placesCount = itinerary.reduce(
          (acc: number, day: any) => acc + (day.places?.length || 0),
          0
        );
        const totalPrice = itinerary.reduce((acc: number, day: any) => {
          const dayTotal = (day.places || []).reduce(
            (pAcc: number, p: any) => pAcc + (Number(p.average_price_pln) || 0),
            0
          );
          return acc + dayTotal;
        }, 0);

        console.log("[handleSaveTrip] Calling API.saveTrip...");
        const savedTrip = await API.saveTrip(currentUser.id, {
          title: editTitle || currentPlan.destination || "New Adventure",
          description: editSummary || currentPlan.summary || "AI Generated Trip",
          itinerary: itinerary,
          summary: editSummary || currentPlan.summary || "",
          destination: editTitle || currentPlan.destination || "",
          days: itinerary.length,
          places_count: placesCount,
          price_total: Math.round(totalPrice) || 0,
          vibe: editVibe || (currentPlan as any).vibe || tripDetails.description || "Custom",
          energy_level: editEnergyLevel || (currentPlan as any).energy_level || "Moderate",
          image_url: bannerUrl || undefined,
          visibility: editVisibility,
          category: (currentPlan as any).category,
        });

        if (savedTrip && savedTrip.id) {
          console.log("[handleSaveTrip] Trip saved successfully, ID:", savedTrip.id);
          setSavedTripId(String(savedTrip.id));
        }
        setToastMessage("Voyage Stored!");
      }
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3000);
    } catch (err: any) {
      console.error("[handleSaveTrip] Save Trip Error:", err);
      // Give user feedback on error
      setToastMessage(`Error: ${err.message || "Failed to save"}`);
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 5000);
    } finally {
      setIsSaving(false);
      console.log("[handleSaveTrip] Save process finished.");
    }
  };

  const ProgressBar = () => (
    <div className="flex flex-col gap-8">
      {[
        { num: 1, label: "Route", icon: Compass },
        { num: 2, label: "Specs", icon: MoreHorizontal },
        { num: 3, label: "Voyage", icon: Sparkles },
      ].map((item) => (
        <div key={item.num} className="flex items-center gap-4 group">
          <div
            className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 border ${
              step >= item.num
                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
                : "bg-white border-gray-100 text-gray-300"
            }`}
          >
            <item.icon size={20} />
          </div>
          <div className="hidden xl:flex flex-col">
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${step >= item.num ? "text-gray-900" : "text-gray-300"}`}
            >
              Step 0{item.num}
            </span>
            <span
              className={`text-xs font-bold ${step >= item.num ? "text-blue-600" : "text-gray-300"}`}
            >
              {item.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "food":
        return "🍴";
      case "culture":
        return "🏛️";
      case "nature":
        return "🌳";
      case "nightlife":
        return "🌙";
      case "sleep":
        return "🛌";
      case "parking":
        return "🅿️";
      default:
        return "📍";
    }
  };

  const handleCoordinatesFetched = (
    idx: number,
    lat: number,
    lng: number,
    website?: string,
    photoUrl?: string
  ) => {
    updatePlace(selectedDayId || 1, idx, {
      lat,
      lng,
      googleMapsUri: website,
      image_url: photoUrl,
    });
  };

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    // Split by bold (**text**) and newlines (\n)
    const parts = text.split(/(\*\*.*?\*\*|\n)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-black text-inherit">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part === "\n") {
        return <br key={i} />;
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-blue-100">
      <AnimatePresence>
        {showSaveToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[300] bg-gray-900/90 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <IoCheckmarkCircle className="text-green-400 text-xl" />
            <span className="text-white text-sm font-bold uppercase tracking-widest">
              {toastMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto pt-40 pb-20 px-6 md:px-12">
        <AnimatePresence mode="wait">
          {step < 3 ? (
            <div className="flex flex-col lg:flex-row gap-12 items-start relative">
              <div className="hidden lg:block sticky top-40 shrink-0">
                <ProgressBar />
              </div>
              <div className="flex-1 w-full lg:max-w-2xl">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-12"
                  >
                    <header>
                      <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-4">
                        Define your <span className="text-gray-400">Route</span>
                      </h1>
                      <p className="text-gray-400 font-medium max-w-sm">
                        Map your dream voyage across cities and borders with our AI logistics
                        engine.
                      </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-sm">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm shadow-blue-100">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                            Departure
                          </span>
                          <input
                            type="date"
                            value={tripDetails.dateFrom}
                            min={new Date().toISOString().split("T")[0]}
                            maxLength={10}
                            onChange={(e) => {
                              const newFrom = e.target.value;
                              const currentToDate = new Date(tripDetails.dateTo);
                              const newFromDate = new Date(newFrom);

                              // If new departure is after current return, move return to match
                              if (newFromDate > currentToDate) {
                                setTripDetails({
                                  ...tripDetails,
                                  dateFrom: newFrom,
                                  dateTo: newFrom,
                                });
                                return;
                              }

                              const diffDays =
                                Math.ceil(
                                  (currentToDate.getTime() - newFromDate.getTime()) /
                                    (1000 * 3600 * 24)
                                ) + 1;

                              if (diffDays > 7) {
                                // Reset To to From + 6 days
                                const maxTo = new Date(newFromDate);
                                maxTo.setDate(maxTo.getDate() + 6);
                                setTripDetails({
                                  ...tripDetails,
                                  dateFrom: newFrom,
                                  dateTo: maxTo.toISOString().split("T")[0],
                                });
                              } else {
                                setTripDetails({ ...tripDetails, dateFrom: newFrom });
                              }
                            }}
                            className="bg-transparent border-none text-xl font-bold text-gray-900 outline-none w-full"
                          />
                        </div>
                      </div>

                      <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-sm">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm shadow-indigo-100">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                            Return
                          </span>
                          <input
                            type="date"
                            value={tripDetails.dateTo}
                            min={tripDetails.dateFrom || new Date().toISOString().split("T")[0]}
                            maxLength={10}
                            onChange={(e) => {
                              const newTo = e.target.value;
                              const currentFrom = new Date(tripDetails.dateFrom);
                              const newToDate = new Date(newTo);
                              const diffDays =
                                Math.ceil(
                                  (newToDate.getTime() - currentFrom.getTime()) / (1000 * 3600 * 24)
                                ) + 1;

                              if (diffDays > 7) {
                                // Cap at 7 days from From
                                const maxTo = new Date(currentFrom);
                                maxTo.setDate(maxTo.getDate() + 6);
                                setTripDetails({
                                  ...tripDetails,
                                  dateTo: maxTo.toISOString().split("T")[0],
                                });
                              } else {
                                setTripDetails({ ...tripDetails, dateTo: newTo });
                              }
                            }}
                            className="bg-transparent border-none text-xl font-bold text-gray-900 outline-none w-full"
                          />
                        </div>
                      </div>
                    </div>

                    {plannedDays >= 7 && (
                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                          Maximum voyage duration (7 days) reached to ensure elite plan quality.
                        </p>
                      </div>
                    )}

                    <div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-sm">
                      <h3 className="font-black text-2xl tracking-tight text-gray-900 mb-8">
                        Destinations
                      </h3>
                      <div className="space-y-4">
                        {destinations.map((dest: any) => (
                          <div key={dest.id} className="group relative">
                            <div
                              className={`flex items-center gap-4 bg-gray-50/50 hover:bg-white border transition-all duration-300 rounded-[2rem] p-3 pl-8 shadow-sm ${!dest.isValid && dest.name.length > 2 ? "border-rose-100 ring-2 ring-rose-50" : "border-gray-100 hover:border-blue-200"}`}
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <MapPin
                                  className={`w-5 h-5 ${!dest.isValid && dest.name.length > 2 ? "text-rose-500" : "text-blue-500"}`}
                                />
                                <div className="flex-1 relative">
                                  <input
                                    type="text"
                                    value={dest.name}
                                    onChange={(e) => updateDestinationName(dest.id, e.target.value)}
                                    onBlur={(e) => validateCity(dest.id, e.target.value)}
                                    placeholder="Where to next?"
                                    maxLength={100}
                                    className="bg-transparent border-none py-4 text-xl font-bold text-gray-900 outline-none placeholder:text-gray-300 w-full"
                                  />
                                  {dest.isValidating && (
                                    <div className="absolute left-0 -bottom-1 flex items-center gap-1.5 animate-pulse">
                                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                                      <span className="text-[8px] font-black uppercase tracking-widest text-blue-600">
                                        Verifying city...
                                      </span>
                                    </div>
                                  )}
                                  {!dest.isValidating && !dest.isValid && dest.name.length > 2 && (
                                    <div className="absolute left-0 -bottom-1 flex items-center gap-1.5">
                                      <span className="text-[8px] font-black uppercase tracking-widest text-rose-500">
                                        Location not recognized
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 pr-2">
                                <div className="flex items-center bg-white rounded-xl p-1 border border-gray-100 shadow-sm">
                                  <button
                                    onClick={() => handleDaysChange(dest.id, -1)}
                                    className="p-2.5 text-gray-300 hover:text-blue-600 transition-colors"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="w-8 text-center font-black text-sm text-gray-900">
                                    {dest.days}
                                  </span>
                                  <button
                                    onClick={() => handleDaysChange(dest.id, 1)}
                                    className="p-2.5 text-gray-300 hover:text-blue-600 transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                                <button
                                  onClick={() =>
                                    destinations.length > 1 &&
                                    setDestinations(
                                      destinations.filter((d: any) => d.id !== dest.id)
                                    )
                                  }
                                  className="p-3 text-gray-300 hover:text-rose-500 transition-colors"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={addDestination}
                        className="mt-8 w-full flex items-center justify-center gap-3 bg-gray-50 hover:bg-white border border-gray-100 hover:border-blue-200 px-8 py-5 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] text-gray-500 hover:text-blue-600 group shadow-sm"
                      >
                        <Plus className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                        Add Another Stop
                      </button>
                    </div>

                    <button
                      onClick={() => setStep(2)}
                      disabled={!isDaysMatch || !allCitiesValid}
                      className="group flex items-center justify-center gap-4 bg-gray-900 text-white px-12 py-6 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-200 disabled:opacity-20 disabled:scale-100"
                    >
                      Continue to Specs
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-12"
                  >
                    <header>
                      <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-4">
                        Final <span className="text-gray-400">Specs</span>
                      </h1>
                      <p className="text-gray-400 font-medium max-w-sm">
                        Fine-tune the parameters of your AI-generated plan for a perfectly tailored
                        journey.
                      </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                      <div className="bg-white border border-gray-100 p-8 lg:p-10 rounded-[2.5rem] group hover:border-blue-200 transition-all shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
                            <Wallet size={18} />
                          </div>
                          <h3 className="font-black uppercase tracking-widest text-[10px] text-gray-400">
                            Target Budget
                          </h3>
                        </div>
                        <div className="flex items-baseline gap-3 min-w-0 overflow-hidden">
                          <input
                            type="number"
                            min="0"
                            value={tripDetails.budget}
                            onChange={(e) => handleBudgetChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="bg-transparent border-none text-4xl lg:text-5xl font-black tracking-tighter text-gray-900 outline-none w-full min-w-0"
                            placeholder="0"
                            max={9999999}
                          />
                          <span className="text-xl font-black text-gray-300 uppercase tracking-widest shrink-0">
                            PLN
                          </span>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-100 p-8 lg:p-10 rounded-[2.5rem] group hover:border-purple-200 transition-all shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm">
                            <Compass size={18} />
                          </div>
                          <h3 className="font-black uppercase tracking-widest text-[10px] text-gray-400">
                            Must-See Icons
                          </h3>
                        </div>
                        <textarea
                          value={tripDetails.mustSee}
                          onChange={(e) =>
                            setTripDetails({ ...tripDetails, mustSee: e.target.value })
                          }
                          placeholder="Eiffel Tower, local gems..."
                          maxLength={500}
                          className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 text-gray-900 font-bold outline-none w-full h-28 focus:border-purple-200 focus:bg-white transition-all text-xs"
                        />
                      </div>

                      <div className="bg-white border border-gray-100 p-8 lg:p-10 rounded-[2.5rem] group hover:border-blue-200 transition-all shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
                            <MessageSquare size={18} />
                          </div>
                          <h3 className="font-black uppercase tracking-widest text-[10px] text-gray-400">
                            Personal Vibe
                          </h3>
                        </div>
                        <textarea
                          value={tripDetails.description}
                          onChange={(e) =>
                            setTripDetails({ ...tripDetails, description: e.target.value })
                          }
                          placeholder="Slow mornings, photography..."
                          maxLength={1000}
                          className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 text-gray-900 font-bold outline-none w-full h-28 focus:border-blue-200 focus:bg-white transition-all text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => setStep(1)}
                        className="flex items-center justify-center gap-4 bg-white border border-gray-100 text-gray-400 px-10 py-6 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:text-gray-900 transition-all shadow-sm"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button
                        onClick={startChat}
                        className="flex-1 group bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] py-6 px-12 rounded-[2rem] hover:scale-105 hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-4"
                      >
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        Create Your Voyage
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="hidden lg:block w-[320px] xl:w-[380px] shrink-0 sticky top-40">
                <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-50">
                    <h3 className="font-black text-lg tracking-tight text-gray-900">Summary</h3>
                    <div
                      className={`px-3 py-1 rounded-full font-black text-[8px] uppercase tracking-widest ${isDaysMatch ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                    >
                      {plannedDays} / {totalTripDays} Days
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5">
                          Timeline
                        </p>
                        <p className="text-xs font-bold text-gray-900">
                          {new Date(tripDetails.dateFrom).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          -{" "}
                          {new Date(tripDetails.dateTo).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="relative pl-5 space-y-6 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-gray-100">
                      {destinations.map((dest: any, i: number) => (
                        <div key={dest.id} className="relative">
                          <div
                            className={`absolute -left-[24px] top-1 w-2 h-2 rounded-full border-2 bg-white transition-colors duration-500 ${dest.isValid ? "border-blue-500" : "border-gray-200"}`}
                          />
                          <div>
                            <p
                              className={`text-sm font-black tracking-tight transition-colors ${dest.name ? "text-gray-900" : "text-gray-300"}`}
                            >
                              {dest.name || `Stop 0${i + 1}`}
                            </p>
                            {dest.name && (
                              <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                                {dest.days} Days exploration
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {step === 2 && (
                      <div className="pt-6 border-t border-gray-50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                            Budget
                          </span>
                          <span className="text-sm font-black text-emerald-600">
                            {tripDetails.budget} PLN
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 flex flex-col md:flex-row bg-white z-[200] overflow-hidden"
            >
              <div className="w-full md:w-[600px] lg:w-[650px] xl:w-[700px] h-full flex flex-col bg-white border-r border-gray-100 shadow-2xl shrink-0">
                <div className="px-8 py-6 border-b border-gray-100 bg-white/80 backdrop-blur-xl flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setStep(2)}
                      className="w-10 h-10 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 text-gray-400 hover:text-gray-900 rounded-xl flex items-center justify-center transition-all shadow-sm"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div>
                      <h2 className="font-black text-xl tracking-tight text-gray-900 leading-none">
                        Voyage
                      </h2>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="px-2 py-0.5 bg-blue-600 rounded-full text-[8px] font-black uppercase tracking-widest text-white animate-pulse">
                          Live
                        </div>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          AI Logistics
                        </span>
                      </div>
                    </div>
                  </div>

                  {currentUser && currentPlan && (
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-100/80 p-1 rounded-[16px] flex items-center relative border border-gray-200/50 backdrop-blur-sm">
                        <button
                          onClick={() => setEditMode(false)}
                          className={`relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-[12px] font-black text-[9px] uppercase tracking-widest transition-colors duration-300 ${
                            !editMode ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          <MessageSquare size={12} className={!editMode ? "animate-pulse" : ""} />
                          <span>Chat</span>
                          {!editMode && (
                            <motion.div
                              layoutId="nav-pill"
                              className="absolute inset-0 bg-white rounded-[12px] shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 -z-10"
                              transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                            />
                          )}
                        </button>
                        <button
                          onClick={() => setEditMode(true)}
                          className={`relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-[12px] font-black text-[9px] uppercase tracking-widest transition-colors duration-300 ${
                            editMode ? "text-white" : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          <Pencil size={12} />
                          <span>Editor</span>
                          {editMode && (
                            <motion.div
                              layoutId="nav-pill"
                              className="absolute inset-0 bg-blue-600 rounded-[12px] shadow-[0_4px_15px_rgba(37,99,235,0.3)] -z-10"
                              transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                            />
                          )}
                        </button>
                      </div>
                      {savedTripId && (
                        <button
                          onClick={handleActivate}
                          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                            isActive
                              ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-100"
                              : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100"
                          }`}
                        >
                          {isActive ? (
                            <Power className="w-3.5 h-3.5" />
                          ) : (
                            <Navigation className="w-3.5 h-3.5" />
                          )}
                          {isActive ? "Deactivate" : "Activate"}
                        </button>
                      )}
                      {/* ── Primary action button ── */}
                      {editMode ? (
                        // ALWAYS show Update when in edit mode
                        <button
                          onClick={handleSaveTrip}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-100 active:scale-95"
                        >
                          {isSaving ? (
                            <div className="w-3 h-3 border-2 border-emerald-200 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          {isSaving ? "Saving..." : "Update"}
                        </button>
                      ) : isLoadedFromUrl && savedTripId ? (
                        // Trip loaded from URL → no destructive actions, show saved state
                        <div className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-[9px] font-black uppercase tracking-widest text-gray-400">
                          <IoCheckmarkCircle className="w-3.5 h-3.5 text-emerald-500" />
                          Saved
                        </div>
                      ) : savedTripId ? (
                        // Trip was saved in this session → allow unsave
                        <button
                          onClick={handleSaveTrip}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 bg-rose-500 text-white hover:bg-rose-600 shadow-rose-100 active:scale-95"
                        >
                          {isSaving ? (
                            <div className="w-3 h-3 border-2 border-rose-200 border-t-white rounded-full animate-spin" />
                          ) : (
                            <X className="w-3.5 h-3.5" />
                          )}
                          Remove
                        </button>
                      ) : (
                        // New unsaved trip
                        <button
                          onClick={handleSaveTrip}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 bg-white text-gray-900 border border-gray-100 hover:bg-gray-50 active:scale-95 shadow-gray-200/50"
                        >
                          {isSaving ? (
                            <div className="w-3 h-3 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          Store
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Banner area with editor */}
                {currentPlan && (
                  <div className="relative shrink-0">
                    {/* Banner image */}
                    <div
                      className="relative h-28 overflow-hidden"
                      style={{
                        backgroundImage: bannerUrl
                          ? `url(${bannerUrl})`
                          : "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="absolute inset-0 bg-black/30" />
                      <div className="absolute bottom-3 left-4 text-white">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                          Voyage Banner
                        </p>
                        <p className="text-sm font-black">
                          {currentPlan?.destination || "Your Trip"}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowBannerEditor(!showBannerEditor);
                          if (!bannerSearchQuery)
                            setBannerSearchQuery(currentPlan?.destination || "");
                        }}
                        className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-xl text-white text-[9px] font-black uppercase tracking-widest transition-all"
                      >
                        <Save className="w-3 h-3" />
                        {bannerUrl ? "Change" : "Set Banner"}
                      </button>
                    </div>

                    {/* Inline banner editor */}
                    <AnimatePresence>
                      {showBannerEditor && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-b border-gray-100 bg-gray-50 overflow-hidden"
                        >
                          <div className="p-4">
                            <div className="flex gap-2 mb-3">
                              <input
                                type="text"
                                value={bannerSearchQuery}
                                onChange={(e) => setBannerSearchQuery(e.target.value)}
                                onKeyDown={(e) =>
                                  e.key === "Enter" && searchBannerImages(bannerSearchQuery)
                                }
                                placeholder="Search images..."
                                maxLength={100}
                                className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-blue-300 transition-all"
                              />
                              <button
                                onClick={() => searchBannerImages(bannerSearchQuery)}
                                disabled={isSearchingBanner}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
                              >
                                {isSearchingBanner ? "..." : "Search"}
                              </button>
                              <button
                                onClick={() => setShowBannerEditor(false)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:text-gray-700 bg-white"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            {bannerResults.length > 0 && (
                              <div className="grid grid-cols-3 gap-2">
                                {bannerResults.map((img: any) => (
                                  <button
                                    key={img.id}
                                    onClick={() => {
                                      setBannerUrl(img.regular);
                                      setShowBannerEditor(false);
                                    }}
                                    className="relative aspect-video rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-400 transition-all group"
                                  >
                                    <img
                                      src={img.thumb}
                                      alt={img.alt}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                                    <p className="absolute bottom-1 left-1 text-[8px] text-white/80 font-bold truncate max-w-full px-1">
                                      {img.photographer}
                                    </p>
                                  </button>
                                ))}
                              </div>
                            )}
                            {bannerResults.length === 0 && !isSearchingBanner && (
                              <p className="text-xs text-gray-400 font-medium text-center py-2">
                                Search to find a banner image for your voyage.
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {!editMode && (
                  <div className="px-6 py-4 bg-gray-50/30 border-b border-gray-100 overflow-x-auto no-scrollbar flex gap-2 shrink-0">
                    {currentPlan?.itinerary?.map((day: any) => (
                      <button
                        key={day.day}
                        onClick={() => setSelectedDayId(day.day)}
                        className={`px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap border ${
                          selectedDayId === day.day
                            ? "bg-white text-blue-600 border-blue-100 shadow-sm"
                            : "bg-transparent text-gray-400 border-transparent hover:text-gray-600"
                        }`}
                      >
                        Day {day.day}
                      </button>
                    ))}
                  </div>
                )}

                <div
                  className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50/20"
                  data-lenis-prevent
                >
                  {/* ── EDIT MODE PANEL ── */}
                  <AnimatePresence mode="wait">
                    {editMode ? (
                      <motion.div
                        key="editor"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-5"
                      >
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                            <Pencil size={14} className="text-white" />
                          </div>
                          <div>
                            <p className="font-black text-sm text-gray-900 uppercase tracking-widest">
                              Edit Voyage
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold">
                              Changes apply when you Store
                            </p>
                          </div>
                        </div>

                        {/* Title / Destination */}
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                            Title
                          </label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="e.g. Kraków Weekend"
                            maxLength={100}
                            className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:border-blue-300 transition-all shadow-sm"
                          />
                        </div>

                        {/* Summary */}
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                            Summary
                          </label>
                          <textarea
                            value={editSummary}
                            onChange={(e) => setEditSummary(e.target.value)}
                            rows={4}
                            placeholder="Describe this voyage..."
                            maxLength={2000}
                            className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:border-blue-300 transition-all shadow-sm resize-none leading-relaxed"
                          />
                        </div>

                        {/* Vibe */}
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                            Vibe
                          </label>
                          <input
                            type="text"
                            value={editVibe}
                            onChange={(e) => setEditVibe(e.target.value)}
                            placeholder="e.g. Romantic historic whispers"
                            maxLength={100}
                            className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:border-blue-300 transition-all shadow-sm"
                          />
                        </div>

                        {/* Energy Level */}
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                            Energy Level
                          </label>
                          <div className="flex gap-2">
                            {(["Low", "Moderate", "High"] as const).map((lvl) => (
                              <button
                                key={lvl}
                                onClick={() => setEditEnergyLevel(lvl)}
                                className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                                  editEnergyLevel === lvl
                                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100"
                                    : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Visibility */}
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                            Visibility
                          </label>
                          <div className="flex gap-2">
                            {(
                              [
                                ["private", "🔒 Private"],
                                ["friends", "👥 Friends"],
                                ["public", "🌍 Public"],
                              ] as const
                            ).map(([val, label]) => (
                              <button
                                key={val}
                                onClick={() => setEditVisibility(val)}
                                className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                                  editVisibility === val
                                    ? "bg-gray-900 text-white border-gray-900 shadow-lg"
                                    : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* AI Reasoning - read only */}
                        {(currentPlan as any)?.ai_reasoning && (
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                              <Brain size={10} /> AI Strategist Reasoning
                            </label>
                            <div className="p-5 bg-blue-50/40 border border-blue-100 rounded-2xl text-[12px] text-blue-900/80 font-bold leading-relaxed">
                              {(currentPlan as any).ai_reasoning}
                            </div>
                          </div>
                        )}

                        {/* ── Itinerary Manager ─────────────────────────── */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="h-px flex-1 bg-gray-100" />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">
                              Itinerary · {currentPlan?.itinerary?.length || 0} day
                              {(currentPlan?.itinerary?.length || 0) !== 1 ? "s" : ""}
                            </span>
                            <div className="h-px flex-1 bg-gray-100" />
                          </div>

                          {currentPlan?.itinerary?.map((day: any) => (
                            <div
                              key={day.day}
                              className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
                            >
                              {/* Day header */}
                              <div className="flex items-center justify-between px-4 py-3 bg-gray-50/60 border-b border-gray-100">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                                      Day {day.day}
                                    </span>
                                    <span className="flex items-center gap-1 text-[7px] font-black uppercase tracking-widest text-gray-300 bg-gray-100 rounded-full px-2 py-0.5">
                                      <GripVertical size={7} />
                                      Hold &amp; drag to reorder
                                    </span>
                                  </div>
                                  <input
                                    type="text"
                                    value={day.theme || ""}
                                    onChange={(e) => updateDayTheme(day.day, e.target.value)}
                                    placeholder="Enter day title..."
                                    maxLength={100}
                                    className="w-full bg-transparent border-none p-0 text-[11px] font-black text-gray-700 mt-0.5 outline-none placeholder:text-gray-300 focus:text-blue-600 transition-colors"
                                  />
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {/* Remove this day button */}
                                  {currentPlan?.itinerary?.length > 1 && (
                                    <button
                                      onClick={() => removeDay(day.day)}
                                      className="flex items-center justify-center w-7 h-7 rounded-xl bg-gray-100 text-gray-400 hover:bg-rose-100 hover:text-rose-500 transition-all"
                                      title="Remove this day"
                                    >
                                      <X size={10} />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      if (addingToDayId === day.day) {
                                        setAddingToDayId(null);
                                        setPlaceSearchQuery("");
                                        setPlaceSearchResults([]);
                                      } else {
                                        setAddingToDayId(day.day);
                                        setPlaceSearchQuery("");
                                        setPlaceSearchResults([]);
                                      }
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                                      addingToDayId === day.day
                                        ? "bg-blue-600 text-white"
                                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                    }`}
                                  >
                                    <Plus size={10} />
                                    Add Place
                                  </button>
                                </div>
                              </div>

                              {/* Google Places search drawer */}
                              {addingToDayId === day.day && (
                                <div className="px-4 py-3 border-b border-blue-50 bg-blue-50/30">
                                  <div className="relative">
                                    <Search
                                      size={12}
                                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                      autoFocus
                                      type="text"
                                      value={placeSearchQuery}
                                      onChange={(e) => {
                                        const q = e.target.value;
                                        setPlaceSearchQuery(q);
                                        if (placeSearchTimeout.current)
                                          clearTimeout(placeSearchTimeout.current);
                                        placeSearchTimeout.current = setTimeout(
                                          () => searchPlaces(q, day.day),
                                          400
                                        );
                                      }}
                                      placeholder={`Search places in ${currentPlan.destination}...`}
                                      maxLength={100}
                                      className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[11px] font-bold text-gray-900 outline-none focus:border-blue-300 transition-all"
                                    />
                                    {isSearchingPlaces && (
                                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                                    )}
                                  </div>
                                  {placeSearchResults.length > 0 && (
                                    <div className="mt-2 space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                                      {placeSearchResults.map((place: any) => (
                                        <button
                                          key={place.place_id}
                                          onClick={() => handleAddPlaceFromSearch(day.day, place)}
                                          className="w-full text-left px-3 py-2.5 rounded-xl bg-white hover:bg-blue-50 border border-gray-100 hover:border-blue-200 transition-all flex items-start gap-3"
                                        >
                                          <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-black text-gray-900 truncate">
                                              {place.name}
                                            </p>
                                            <p className="text-[9px] text-gray-400 font-bold truncate">
                                              {place.address}
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-1 shrink-0">
                                            {place.rating && (
                                              <span className="text-[9px] font-black text-amber-500">
                                                ★ {place.rating}
                                              </span>
                                            )}
                                            <span className="text-[8px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-500 font-black uppercase">
                                              {place.category}
                                            </span>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                  {placeSearchQuery &&
                                    !isSearchingPlaces &&
                                    placeSearchResults.length === 0 && (
                                      <p className="mt-2 text-center text-[10px] text-gray-400 font-bold">
                                        No results found
                                      </p>
                                    )}
                                </div>
                              )}

                              {/* Places list - draggable */}
                              <Reorder.Group
                                axis="y"
                                values={day.places || []}
                                onReorder={(newOrder: any[]) => reorderPlaces(day.day, newOrder)}
                                className="flex flex-col divide-y divide-gray-50"
                              >
                                {(day.places || []).map((place: any, pIdx: number) => {
                                  // Use a stable key that doesn't change when order changes
                                  const placeKey = `place-${day.day}-${place.name}-${place.lat || ""}-${place.lng || ""}-${place.address || ""}`;
                                  const isExpanded = expandedPlaceKey === placeKey;
                                  const categoryIcons: Record<string, string> = {
                                    culture: "🏛",
                                    food: "🍽",
                                    nature: "🌿",
                                    nightlife: "🎶",
                                    sleep: "🏨",
                                    parking: "🅿️",
                                  };
                                  return (
                                    <Reorder.Item
                                      key={placeKey}
                                      value={place}
                                      className="bg-white select-none"
                                      whileDrag={{
                                        scale: 1.02,
                                        boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                                        zIndex: 50,
                                        borderRadius: "1rem",
                                      }}
                                    >
                                      <div className="flex items-center gap-3 px-4 py-3">
                                        {/* Drag handle */}
                                        <GripVertical
                                          size={14}
                                          className="text-gray-300 hover:text-blue-400 cursor-grab active:cursor-grabbing shrink-0 transition-colors"
                                        />
                                        <span className="text-base shrink-0">
                                          {categoryIcons[place.category] || "📍"}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[11px] font-black text-gray-900 truncate">
                                            {place.name}
                                          </p>
                                          {place.start_time && (
                                            <p className="text-[9px] text-gray-400 font-bold">
                                              {place.start_time}
                                              {place.end_time ? ` → ${place.end_time}` : ""}
                                            </p>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <div className="flex flex-col gap-0 border-r border-gray-100 pr-1 shrink-0">
                                            <button
                                              onClick={() => reorderPlace(day.day, pIdx, "up")}
                                              disabled={pIdx === 0}
                                              className="w-5 h-4 flex items-center justify-center text-gray-400 hover:text-blue-500 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                                            >
                                              <ArrowUp size={10} />
                                            </button>
                                            <button
                                              onClick={() => reorderPlace(day.day, pIdx, "down")}
                                              disabled={pIdx === day.places.length - 1}
                                              className="w-5 h-4 flex items-center justify-center text-gray-400 hover:text-blue-500 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                                            >
                                              <ArrowDown size={10} />
                                            </button>
                                          </div>
                                          <button
                                            onClick={() =>
                                              setExpandedPlaceKey(isExpanded ? null : placeKey)
                                            }
                                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                              isExpanded
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-100 text-gray-400 hover:text-gray-700"
                                            }`}
                                          >
                                            <Pencil size={10} />
                                          </button>
                                          <button
                                            onClick={() => removePlace(day.day, pIdx)}
                                            className="w-7 h-7 rounded-lg bg-gray-100 text-gray-400 hover:bg-rose-100 hover:text-rose-500 flex items-center justify-center transition-all"
                                          >
                                            <X size={10} />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Inline edit expand */}
                                      {isExpanded && (
                                        <div className="px-4 pb-4 space-y-2 bg-gray-50/50 border-t border-gray-100">
                                          <div className="flex items-center gap-2 pt-3">
                                            <div className="flex-1">
                                              <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1 block">
                                                Move to Day
                                              </label>
                                              <select
                                                value={day.day}
                                                onChange={(e) => {
                                                  const targetDay = Number(e.target.value);
                                                  if (targetDay !== day.day) {
                                                    setExpandedPlaceKey(null);
                                                    movePlaceToDay(day.day, pIdx, targetDay);
                                                  }
                                                }}
                                                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-900 outline-none focus:border-blue-300"
                                              >
                                                {currentPlan?.itinerary?.map((d: any) => (
                                                  <option key={d.day} value={d.day}>
                                                    Day {d.day}{" "}
                                                    {d.day === day.day ? "(Current)" : ""}
                                                  </option>
                                                ))}
                                              </select>
                                            </div>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 pt-1">
                                            <div>
                                              <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1 block">
                                                Start
                                              </label>
                                              <input
                                                type="time"
                                                value={place.start_time || ""}
                                                maxLength={5}
                                                onChange={(e) =>
                                                  updatePlace(day.day, pIdx, {
                                                    start_time: e.target.value,
                                                  })
                                                }
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-[11px] font-bold text-gray-900 outline-none focus:border-blue-300"
                                              />
                                            </div>
                                            <div>
                                              <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1 block">
                                                End
                                              </label>
                                              <input
                                                type="time"
                                                value={place.end_time || ""}
                                                maxLength={5}
                                                onChange={(e) =>
                                                  updatePlace(day.day, pIdx, {
                                                    end_time: e.target.value,
                                                  })
                                                }
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-[11px] font-bold text-gray-900 outline-none focus:border-blue-300"
                                              />
                                            </div>
                                          </div>
                                          <div>
                                            <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1 block">
                                              Category
                                            </label>
                                            <select
                                              value={place.category || "culture"}
                                              onChange={(e) =>
                                                updatePlace(day.day, pIdx, {
                                                  category: e.target.value,
                                                })
                                              }
                                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-[11px] font-bold text-gray-900 outline-none focus:border-blue-300"
                                            >
                                              {[
                                                "culture",
                                                "food",
                                                "nature",
                                                "nightlife",
                                                "sleep",
                                                "parking",
                                              ].map((c) => (
                                                <option key={c} value={c}>
                                                  {c.charAt(0).toUpperCase() + c.slice(1)}
                                                </option>
                                              ))}
                                            </select>
                                          </div>
                                          <div>
                                            <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1 block">
                                              Price (PLN)
                                            </label>
                                            <input
                                              type="number"
                                              min="0"
                                              value={place.average_price_pln || 0}
                                              onChange={(e) => {
                                                const val = Number(e.target.value);
                                                updatePlace(day.day, pIdx, {
                                                  average_price_pln: Math.max(0, val),
                                                });
                                              }}
                                              onKeyDown={handleKeyDown}
                                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-[11px] font-bold text-gray-900 outline-none focus:border-blue-300"
                                              max={999999}
                                            />
                                          </div>
                                          <div>
                                            <label className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1 block">
                                              Note / Reason
                                            </label>
                                            <textarea
                                              rows={2}
                                              value={place.reason || ""}
                                              onChange={(e) =>
                                                updatePlace(day.day, pIdx, {
                                                  reason: e.target.value,
                                                })
                                              }
                                              maxLength={1000}
                                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-[11px] font-bold text-gray-900 outline-none focus:border-blue-300 resize-none"
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </Reorder.Item>
                                  );
                                })}
                              </Reorder.Group>

                              {/* Add Day After this day */}
                              <button
                                onClick={() => addDay(day.day)}
                                className="w-full flex items-center justify-center gap-1.5 py-2 text-[8px] font-black uppercase tracking-widest text-gray-300 hover:text-blue-500 hover:bg-blue-50/50 rounded-xl border border-dashed border-gray-100 hover:border-blue-200 transition-all"
                              >
                                <Plus size={9} />
                                Add Day {day.day + 1} after this
                              </button>
                            </div>
                          ))}

                          {/* Add Day at end */}
                          <button
                            onClick={() => addDay()}
                            className="w-full flex items-center justify-center gap-2 py-3.5 text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-2xl border border-dashed border-blue-200 hover:border-blue-300 transition-all"
                          >
                            <Plus size={11} />
                            Add Day {(currentPlan?.itinerary?.length || 0) + 1}
                          </button>
                        </div>

                        <p className="text-center text-[9px] text-gray-400 font-bold pb-2">
                          Use the <span className="text-blue-500">Chat ↔ Editor</span> switch above
                          to exit editing
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="days"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        {isLoading && (
                          <div className="flex flex-col items-center justify-center h-full text-center py-20">
                            <div className="relative w-16 h-16 mb-6">
                              <div className="absolute inset-0 border-4 border-blue-50 rounded-full" />
                              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
                            </div>
                            <h3 className="font-black text-sm uppercase tracking-widest mb-1 text-gray-900">
                              Synthesizing
                            </h3>
                            <p className="text-gray-400 text-[8px] font-black uppercase tracking-[0.4em] animate-pulse">
                              Elite Engine
                            </p>
                          </div>
                        )}

                        {messages
                          .filter((m: any) => !m.hidden)
                          .map((msg: any, index: number) => (
                            <div
                              key={index}
                              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[90%] px-6 py-4 rounded-[1.75rem] text-[15px] font-bold leading-relaxed shadow-sm ${
                                  msg.role === "user"
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-gray-800 border border-gray-100"
                                }`}
                              >
                                {renderMarkdown(msg.content)}
                              </div>
                            </div>
                          ))}

                        {!isLoading &&
                          currentPlan?.itinerary
                            ?.filter((d: any) => d.day === (selectedDayId || 1))
                            .map((day: any) => (
                              <motion.div
                                key={day.day}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                              >
                                <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-lg relative overflow-hidden">
                                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2 block">
                                        Day {day.day}
                                      </span>
                                      <h3 className="font-[1000] text-2xl uppercase tracking-tighter text-gray-900 leading-tight">
                                        {day.theme}
                                      </h3>
                                    </div>

                                    {day.weather_forecast && (
                                      <div className="flex items-center gap-4 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 shadow-sm shrink-0">
                                        <div className="flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-sm text-blue-500">
                                          {day.weather_forecast.condition
                                            ?.toLowerCase()
                                            .includes("rain") ? (
                                            <CloudRain size={20} />
                                          ) : day.weather_forecast.condition
                                              ?.toLowerCase()
                                              .includes("sun") ||
                                            day.weather_forecast.condition
                                              ?.toLowerCase()
                                              .includes("clear") ? (
                                            <Sun size={20} />
                                          ) : (
                                            <Cloud size={20} />
                                          )}
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-1">
                                            <Thermometer size={12} className="text-rose-500" />
                                            <span className="text-sm font-black text-gray-900">
                                              {day.weather_forecast.avg_temp}
                                            </span>
                                          </div>
                                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                            {day.weather_forecast.condition}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {day.accommodation && (
                                    <div className="mt-6 p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 flex items-start gap-4 transition-all hover:bg-blue-50">
                                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                                        <Home size={20} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <a
                                          href={day.accommodation.website_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block font-black text-base uppercase tracking-tight text-blue-900 hover:underline truncate"
                                        >
                                          {day.accommodation.name}
                                        </a>
                                        <p className="text-[11px] text-blue-700/70 font-bold leading-tight mt-1.5">
                                          {day.accommodation.description}
                                        </p>
                                        <div className="mt-2 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                          {(formatCurrency as any)(
                                            day.accommodation.price_per_night,
                                            "ANY",
                                            false
                                          )}{" "}
                                          / night
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-0 pb-10">
                                  {day.places?.map((place: any, i: number) => (
                                    <React.Fragment key={i}>
                                      <div className="group p-7 rounded-[2rem] border border-gray-100 bg-white hover:bg-gray-50 transition-all shadow-sm relative z-10">
                                        <div className="flex gap-5">
                                          <div className="flex flex-col items-center gap-2 shrink-0">
                                            <div className="w-14 h-14 bg-gray-100 rounded-[1.25rem] flex items-center justify-center text-2xl border border-gray-100 transition-transform group-hover:scale-110">
                                              {getCategoryIcon(place.category)}
                                            </div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase">
                                              {place.start_time}
                                            </span>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <a
                                              href={
                                                place.website_url ||
                                                `https://www.google.com/search?q=${encodeURIComponent(place.name + " " + (currentPlan?.destination || ""))}`
                                              }
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-block font-black text-xl uppercase tracking-tight mb-1.5 text-gray-900 hover:text-blue-600 hover:underline transition-colors decoration-2 underline-offset-4"
                                            >
                                              {place.name}
                                            </a>
                                            <p className="text-[13px] text-gray-500 font-bold leading-relaxed line-clamp-3 mb-4">
                                              {place.reason}
                                            </p>

                                            <div className="flex items-center gap-3">
                                              <div
                                                className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
                                                  place.price_range?.toLowerCase().includes("free")
                                                    ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                                                    : place.price_range === "?"
                                                      ? "bg-gray-50 border-gray-100 text-gray-400"
                                                      : "bg-blue-50 border-blue-100 text-blue-600"
                                                }`}
                                              >
                                                <Wallet size={12} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                  {place.price_range}
                                                </span>
                                              </div>

                                              {place.rating && (
                                                <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center gap-2">
                                                  <span className="text-[10px] font-black uppercase tracking-widest">
                                                    ★ {place.rating}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Walking time connector */}
                                      {i < day.places.length - 1 && (
                                        <div className="relative py-4 ml-14 flex items-center gap-4">
                                          <div className="absolute left-[-1px] top-0 bottom-0 w-[2px] border-l-2 border-dashed border-gray-200" />
                                          <div className="z-20 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex items-center gap-3 shadow-sm hover:border-blue-200 transition-colors group/transit">
                                            <Footprints
                                              size={14}
                                              className="text-gray-400 group-hover/transit:text-blue-500 transition-colors"
                                            />
                                            <span className="text-[9px] font-black text-gray-400 group-hover/transit:text-gray-600 uppercase tracking-[0.2em]">
                                              {place.walking_time_to_next || "5-10 min walk"}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </motion.div>
                            ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {!editMode && (
                  <div className="p-6 bg-white border-t border-gray-100 shrink-0">
                    <form onSubmit={handleSendMessage} className="relative flex items-center gap-4">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Refine Voyage..."
                        maxLength={500}
                        className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl py-5 px-7 text-sm font-bold text-gray-900 outline-none focus:border-blue-200 transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!inputValue.trim() || isLoading}
                        className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-gray-800 transition-all shadow-lg"
                      >
                        <Send size={20} />
                      </button>
                    </form>
                  </div>
                )}
              </div>

              <div className="hidden md:block flex-1 relative bg-gray-100">
                <Map
                  places={
                    currentPlan?.itinerary?.find((d: any) => d.day === (selectedDayId || 1))
                      ?.places || []
                  }
                  destinationName={currentPlan?.destination}
                  onCoordinatesFetched={handleCoordinatesFetched}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.05); border-radius: 20px; }
      `,
        }}
      />
    </div>
  );
}
