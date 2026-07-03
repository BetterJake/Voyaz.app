"use client";
import * as React from "react";
import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  MapPin,
  Send,
  Wallet,
  Compass,
  MoreHorizontal,
  Home,
  Car,
  CloudSun,
  Clock,
  ExternalLink,
  Sun,
  Sunset,
  Moon,
  Thermometer,
  Zap,
  ShieldCheck,
  Database,
  Globe,
  RefreshCcw,
  AlertCircle,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useTrip } from "@/context/TripContext";
import { usePreferences } from "@/context/PreferencesContext";
import { generateDirectionsUrl } from "@/utils/googleMaps";
import { Place } from "@/features/trips/types";
import { useRouter } from "next/navigation";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center font-black text-gray-400 uppercase tracking-widest text-[10px]">
      Initializing Neural Map...
    </div>
  ),
});

const Step3Plan: React.FC = () => {
  const router = useRouter();
  const {
    setStep,
    currentPlan,
    selectedDayId,
    setSelectedDayId,
    messages,
    isLoading,
    inputValue,
    setInputValue,
    sendMessage,
    retryLastMessage,
    updatePlace,
    editingPlace,
    setEditingPlace,
  } = useTrip();
  const { formatTemperature } = usePreferences();

  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const placeRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [focusedPlaceIndex, setFocusedPlaceIndex] = useState<number | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingMessages = [
    { text: "Synthesizing Elite Itinerary...", icon: <Compass className="text-blue-500" /> },
    { text: "Analyzing Micro-Climate Data...", icon: <CloudSun className="text-amber-500" /> },
    { text: "Optimizing Walking Logistics...", icon: <Zap className="text-yellow-500" /> },
    { text: "Fetching Real-Time Prices...", icon: <Wallet className="text-green-500" /> },
    { text: "Validating Geographic Coordinates...", icon: <Globe className="text-blue-400" /> },
    { text: "Finalizing Your Voyage...", icon: <ShieldCheck className="text-emerald-500" /> },
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (focusedPlaceIndex !== null) {
      const ref = placeRefs.current[`${selectedDayId}-${focusedPlaceIndex}`];
      if (ref) {
        ref.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [focusedPlaceIndex, selectedDayId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage({ role: "user", content: inputValue });
    setInputValue("");
  };

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

  const getTimeOfDayIcon = (startTime: string) => {
    const hour = parseInt(startTime.split(":")[0]);
    if (hour < 12) return <Sun className="text-amber-500" size={14} />;
    if (hour < 18) return <Sunset className="text-orange-500" size={14} />;
    return <Moon className="text-blue-400" size={14} />;
  };

  const getTimeOfDayLabel = (startTime: string) => {
    const hour = parseInt(startTime.split(":")[0]);
    if (hour < 12) return "Morning";
    if (hour < 18) return "Afternoon";
    return "Evening";
  };

  const allPlaces = useMemo(() => {
    const list: { name: string; dayId: number; index: number }[] = [];
    currentPlan?.itinerary?.forEach((day: any) => {
      day.places?.forEach((place: any, idx: number) => {
        list.push({ name: place.name, dayId: day.day, index: idx });
      });
    });
    return list;
  }, [currentPlan]);

  const renderMessageContent = (content: string) => {
    // 1. Initial split by markdown (bold and newline)
    const initialParts: (string | React.ReactNode)[] = content
      .split(/(\*\*.*?\*\*|\n)/g)
      .map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={`bold-${i}`} className="font-black text-inherit">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part === "\n") {
          return <br key={`br-${i}`} />;
        }
        return part;
      });

    if (!allPlaces.length) return initialParts;
    const sortedPlaces = [...allPlaces].sort((a, b) => b.name.length - a.name.length);
    let parts = initialParts;

    sortedPlaces.forEach((place) => {
      const newParts: (string | React.ReactNode)[] = [];
      parts.forEach((part) => {
        if (typeof part !== "string") {
          newParts.push(part);
          return;
        }
        const regex = new RegExp(`(${place.name})`, "gi");
        const split = part.split(regex);
        split.forEach((subPart, i) => {
          if (subPart.toLowerCase() === place.name.toLowerCase()) {
            newParts.push(
              <button
                key={`${place.name}-${i}`}
                onClick={() => {
                  setSelectedDayId(place.dayId);
                  setFocusedPlaceIndex(place.index);
                }}
                className="text-blue-600 font-black hover:underline inline-flex items-center gap-0.5 bg-blue-50 px-1.5 py-0.5 rounded-md transition-colors"
              >
                {subPart} <ExternalLink size={10} />
              </button>
            );
          } else if (subPart !== "") {
            newParts.push(subPart);
          }
        });
      });
      parts = newParts;
    });
    return parts;
  };

  const currentDayPlaces =
    currentPlan?.itinerary?.find((d: any) => d.day === (selectedDayId || 1))?.places || [];

  const handleCoordinatesFetched = useCallback(
    (idx: number, lat: number, lng: number, website?: string, photoUrl?: string) => {
      const dayToUpdate = selectedDayId || 1;
      console.log(`[Step3Plan] handleCoordinatesFetched for Day ${dayToUpdate}, Index ${idx}:`, {
        lat,
        lng,
        website,
      });

      // Ensure we update the correct day even if selectedDayId changed (though here we use the one from the closure)
      updatePlace(dayToUpdate, idx, {
        lat,
        lng,
        googleMapsUri: website,
        image_url: photoUrl,
        // Also update rating if we got it from Google
      });
    },
    [selectedDayId, updatePlace]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 flex flex-col md:flex-row bg-[#F8F9FA] z-50 overflow-hidden"
    >
      <div className="w-full md:w-[40%] h-full flex flex-col bg-white shadow-2xl z-20 border-r border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/trips")}
              className="w-10 h-10 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 text-gray-400 hover:text-gray-900 rounded-xl flex items-center justify-center transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="font-[1000] text-2xl tracking-tighter uppercase">
                Voyaz <span className="text-blue-600">Engine</span>
              </h2>
              <p className="text-[10px] font-black text-blue-500/60 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" /> Precision System v2.0
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50/30 border-b border-gray-100 overflow-x-auto no-scrollbar flex gap-2 shrink-0">
          {currentPlan?.itinerary?.map((day: any) => (
            <button
              key={day.day}
              onClick={() => {
                setSelectedDayId(day.day);
                setFocusedPlaceIndex(null);
              }}
              className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border-2 flex flex-col items-center gap-1 min-w-[110px] ${
                selectedDayId === day.day
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-105"
                  : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
              }`}
            >
              <span>Day {day.day}</span>
              {day.weather_forecast && (
                <span
                  className={`flex items-center gap-1 text-[9px] font-black ${selectedDayId === day.day ? "text-blue-100" : "text-blue-500"}`}
                >
                  {formatTemperature(parseInt(day.weather_forecast.avg_temp))}
                </span>
              )}
            </button>
          ))}
        </div>

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-12 bg-[#FDFDFD] custom-scrollbar relative"
          data-lenis-prevent
        >
          {isLoading && (
            <div className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center">
              <div className="relative w-32 h-32 mb-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-[6px] border-blue-50 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-[6px] border-blue-500 rounded-full border-t-transparent"
                />
                <div className="absolute inset-0 m-auto w-12 h-12 flex items-center justify-center bg-blue-500 rounded-2xl shadow-xl shadow-blue-200">
                  <Compass className="w-7 h-7 text-white animate-pulse" />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={loadingStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center gap-3">
                    {loadingMessages[loadingStep].icon}
                    <h3 className="font-[1000] text-2xl text-gray-900 uppercase tracking-tighter">
                      {loadingMessages[loadingStep].text.split(" ")[0]}{" "}
                      <span className="text-blue-600">
                        {loadingMessages[loadingStep].text.split(" ").slice(1).join(" ")}
                      </span>
                    </h3>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          idx === loadingStep ? "w-8 bg-blue-600" : "w-2 bg-gray-100"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse mt-8">
                    Neural Engine Processing...
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {messages
            .filter((m) => !m.hidden)
            .map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-4`}
              >
                <div
                  className={`max-w-[85%] px-5 py-4 rounded-[1.5rem] text-sm font-bold leading-relaxed relative group ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-100"
                      : msg.isError
                        ? "bg-red-50 border-2 border-red-100 text-red-600 shadow-sm"
                        : "bg-white border border-gray-100 text-gray-800 shadow-sm"
                  }`}
                >
                  {msg.isError && <AlertCircle className="inline-block w-4 h-4 mr-2 -mt-0.5" />}
                  {renderMessageContent(msg.content)}

                  {msg.isError && index === messages.length - 1 && !isLoading && (
                    <button
                      onClick={() => retryLastMessage()}
                      className="mt-3 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                    >
                      <RefreshCcw className="w-3.5 h-3.5" /> Retry Synthesis
                    </button>
                  )}
                </div>
              </div>
            ))}

          <AnimatePresence mode="wait">
            {!isLoading &&
              currentPlan?.itinerary
                ?.filter((d: any) => d.day === (selectedDayId || 1))
                .map((day: any) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-12 pb-10"
                  >
                    <div className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/[0.03] rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110" />
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                          <h3 className="font-[1000] text-gray-900 text-4xl tracking-tighter uppercase leading-none">
                            {day.theme}
                          </h3>
                          {day.weather_forecast && (
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 shadow-sm">
                                <CloudSun size={18} />
                                <span className="text-lg font-[1000]">
                                  {formatTemperature(parseInt(day.weather_forecast.avg_temp))}
                                </span>
                              </div>
                              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                                {day.weather_forecast.condition}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mb-8">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">
                            <Zap size={10} /> Strategy Active
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-100">
                            Day {day.day} • {day.places?.length || 0} Points
                          </div>
                        </div>

                        {day.accommodation && (
                          <div className="mt-8 p-6 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 flex items-center gap-6 group/hotel cursor-pointer hover:bg-gray-100/50 transition-colors">
                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-blue-600 shadow-xl shadow-gray-200 shrink-0 border border-gray-100 group-hover/hotel:scale-110 transition-transform">
                              <Home size={28} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1">
                                Base for the Night
                              </p>
                              <a
                                href={day.accommodation.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block font-[1000] text-xl uppercase tracking-tighter text-gray-900 hover:text-blue-600 transition-colors truncate"
                              >
                                {day.accommodation.name}
                              </a>
                              <p className="text-[10px] text-gray-400 font-bold mt-1 line-clamp-1">
                                {day.accommodation.description}
                              </p>
                            </div>
                          </div>
                        )}

                        {day.places && day.places.length > 0 && (
                          <a
                            href={generateDirectionsUrl(day.places)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-8 flex items-center justify-center gap-3 bg-gray-900 text-white py-6 rounded-[2.5rem] shadow-2xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-[12px] uppercase tracking-[0.3em] w-full"
                          >
                            <MapPin className="w-5 h-5 text-blue-400" /> Start Elite Route
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="relative ml-4 md:ml-6">
                      <div className="absolute left-[27px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-blue-600 via-gray-100 to-transparent" />

                      <div className="space-y-16">
                        {day.places?.map((place: any, i: number) => {
                          const isEditing =
                            editingPlace?.dayId === day.day && editingPlace?.placeIdx === i;
                          const isFocused = focusedPlaceIndex === i;
                          const showTimeLabel =
                            i === 0 ||
                            getTimeOfDayLabel(place.start_time) !==
                              getTimeOfDayLabel(day.places[i - 1].start_time);

                          return (
                            <div key={i} className="space-y-8">
                              {showTimeLabel && (
                                <div className="relative z-10 flex items-center gap-4 -ml-4">
                                  <div className="bg-white px-5 py-2.5 rounded-2xl border-2 border-gray-50 shadow-xl shadow-gray-100 flex items-center gap-3">
                                    {getTimeOfDayIcon(place.start_time)}
                                    <span className="text-[11px] font-[1000] uppercase tracking-[0.2em] text-gray-900">
                                      {getTimeOfDayLabel(place.start_time)}
                                    </span>
                                  </div>
                                  <div className="h-[2px] flex-1 bg-gray-50" />
                                </div>
                              )}

                              <div
                                ref={(el) => {
                                  placeRefs.current[`${day.day}-${i}`] = el;
                                }}
                                className={`relative flex gap-8 transition-all duration-500 group cursor-pointer ${
                                  isFocused ? "scale-[1.05]" : "hover:translate-x-2"
                                }`}
                                onClick={() => setFocusedPlaceIndex(i)}
                              >
                                <div className="relative shrink-0 flex flex-col items-center">
                                  <motion.div
                                    animate={
                                      isFocused
                                        ? {
                                            scale: 1.25,
                                            backgroundColor: "#2563EB",
                                            borderRadius: "24px",
                                          }
                                        : {
                                            scale: 1,
                                            backgroundColor: "#FFFFFF",
                                            borderRadius: "20px",
                                          }
                                    }
                                    className={`w-14 h-14 flex items-center justify-center text-2xl border-4 z-10 shadow-2xl transition-all ${
                                      isFocused
                                        ? "border-blue-100 text-white"
                                        : "border-white text-gray-700 bg-white"
                                    }`}
                                  >
                                    <span
                                      className={`absolute -top-4 -left-4 w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-[1000] border-4 shadow-xl transition-all ${
                                        isFocused
                                          ? "bg-white text-blue-600 border-blue-600 scale-110"
                                          : "bg-gray-900 text-white border-white"
                                      }`}
                                    >
                                      {i + 1}
                                    </span>
                                    {getCategoryIcon(place.category)}
                                  </motion.div>
                                  <div className="mt-4 flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-100 rounded-xl shadow-sm">
                                    <Clock
                                      size={12}
                                      className={isFocused ? "text-blue-600" : "text-gray-400"}
                                    />
                                    <span className="text-[10px] font-[1000] text-gray-900">
                                      {place.start_time}
                                    </span>
                                  </div>
                                </div>

                                <div
                                  className={`flex-1 min-w-0 pt-1 pb-4 transition-all duration-500 ${isFocused ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`}
                                >
                                  {isEditing ? (
                                    <div
                                      className="bg-white p-8 rounded-[2.5rem] border-4 border-blue-600 shadow-2xl space-y-4"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <input
                                        className="w-full text-lg font-black p-4 bg-gray-50 border-none rounded-2xl outline-none"
                                        value={place.name}
                                        onChange={(e) =>
                                          updatePlace(day.day, i, { name: e.target.value })
                                        }
                                      />
                                      <div className="flex gap-4">
                                        <input
                                          className="w-full text-sm p-4 bg-gray-50 border-none rounded-2xl font-bold"
                                          type="time"
                                          value={place.start_time}
                                          onChange={(e) =>
                                            updatePlace(day.day, i, { start_time: e.target.value })
                                          }
                                        />
                                        <input
                                          className="w-full text-sm p-4 bg-gray-50 border-none rounded-2xl font-bold"
                                          type="time"
                                          value={place.end_time}
                                          onChange={(e) =>
                                            updatePlace(day.day, i, { end_time: e.target.value })
                                          }
                                        />
                                      </div>
                                      <button
                                        onClick={() => setEditingPlace(null)}
                                        className="w-full font-[1000] text-sm uppercase tracking-widest bg-blue-600 text-white py-5 rounded-[1.5rem] shadow-xl shadow-blue-200"
                                      >
                                        Save Intelligence
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex gap-8 items-start">
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between mb-3">
                                          <h4
                                            className={`font-[1000] text-3xl uppercase tracking-tighter leading-none transition-colors ${
                                              isFocused ? "text-blue-600" : "text-gray-900"
                                            }`}
                                          >
                                            {place.name}
                                          </h4>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingPlace({ dayId: day.day, placeIdx: i });
                                            }}
                                            className="p-2.5 hover:bg-gray-100 rounded-2xl transition-colors text-gray-300 hover:text-blue-600"
                                          >
                                            <MoreHorizontal className="w-6 h-6" />
                                          </button>
                                        </div>

                                        <p
                                          className={`text-[15px] font-bold leading-relaxed mb-6 transition-colors ${
                                            isFocused ? "text-gray-900" : "text-gray-500"
                                          }`}
                                        >
                                          {place.reason}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-4">
                                          {place.price_range && (
                                            <div
                                              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-[1000] border-2 shadow-sm transition-all ${
                                                isFocused
                                                  ? "bg-green-600 text-white border-green-600 scale-110"
                                                  : "bg-green-50 text-green-700 border-green-100"
                                              }`}
                                            >
                                              <Wallet className="w-4 h-4" /> {place.price_range}
                                            </div>
                                          )}
                                          {place.rating && (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-2xl text-xs font-[1000] border border-amber-100 shadow-sm">
                                              ★ {place.rating}
                                            </div>
                                          )}
                                          <div
                                            className={`px-4 py-2 rounded-2xl text-[10px] font-[1000] uppercase tracking-widest border transition-colors ${
                                              isFocused
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "bg-gray-50 text-gray-400 border-gray-100"
                                            }`}
                                          >
                                            {place.category}
                                          </div>
                                          {place.googleMapsUri && (
                                            <a
                                              href={place.googleMapsUri}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              onClick={(e) => e.stopPropagation()}
                                              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-[1000] uppercase tracking-widest border-2 transition-all hover:scale-105 ${
                                                isFocused
                                                  ? "bg-white text-blue-600 border-white shadow-xl"
                                                  : "bg-blue-50 text-blue-600 border-blue-600/10"
                                              }`}
                                            >
                                              <ExternalLink size={12} /> Explore
                                            </a>
                                          )}
                                        </div>
                                      </div>

                                      {place.image_url && (
                                        <motion.div
                                          initial={{ opacity: 0, x: 20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl shadow-gray-300 shrink-0 mt-2 hover:scale-110 transition-transform duration-500"
                                        >
                                          <img
                                            src={place.image_url}
                                            alt={place.name}
                                            className="w-full h-full object-cover"
                                          />
                                        </motion.div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-15px_50px_-20px_rgba(0,0,0,0.08)]">
          <form onSubmit={handleSendMessage} className="relative flex items-center gap-4">
            <div className="relative flex-1 group">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Suggest modifications to this elite route..."
                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-[2rem] py-5 px-8 text-sm font-bold text-gray-800 outline-none transition-all shadow-inner"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-300 group-focus-within:text-blue-600 transition-colors">
                <Database size={16} />
              </div>
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="w-16 h-16 bg-gray-900 text-white rounded-[2rem] flex items-center justify-center hover:bg-black disabled:opacity-20 transition-all shadow-2xl hover:scale-110 active:scale-95 group"
            >
              <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>

      <div className="hidden md:block flex-1 relative overflow-hidden bg-gray-100">
        <Map
          places={currentDayPlaces}
          focusedPlaceIndex={focusedPlaceIndex}
          onMarkerClick={(idx) => setFocusedPlaceIndex(idx)}
          onCoordinatesFetched={handleCoordinatesFetched}
        />

        <div className="absolute bottom-10 left-10 right-10 pointer-events-none">
          <div className="max-w-max bg-black text-white p-5 rounded-[2.5rem] border border-white/10 shadow-2xl pointer-events-auto flex items-center gap-8 backdrop-blur-2xl">
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                  Voyaz Intelligence
                </span>
                <span className="text-[12px] font-bold">Elite Navigation Active</span>
              </div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                Target
              </span>
              <span className="text-[12px] font-bold">
                {currentPlan?.destination || "Processing..."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Step3Plan;
