"use client";
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { APIProvider, Map, Marker, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import {
  Navigation,
  X,
  LocateFixed,
  AlertCircle,
  ChevronRight,
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
  CornerUpLeft,
  CornerUpRight,
  RotateCw,
  RotateCcw,
  Flag,
  Play,
  Square,
  RefreshCw,
  Car,
  Footprints,
} from "lucide-react";
import { useTrip } from "@/context/TripContext";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const STEP_ADVANCE_THRESHOLD_M = 25;
const ARRIVAL_THRESHOLD_M = 30;

interface LatLng {
  lat: number;
  lng: number;
}
interface PlaceRef {
  name: string;
  lat: number;
  lng: number;
  start_time?: string;
  category?: string;
  dayIndex: number;
  placeIndex: number;
}
function formatDistance(m: number): string {
  if (!isFinite(m) || m < 0) return "-";
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(m < 10000 ? 1 : 0)} km`;
}
function formatDuration(s: number): string {
  if (!isFinite(s) || s < 0) return "-";
  if (s < 60) return `${Math.round(s)}s`;
  const mins = Math.round(s / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
function formatETA(remainingSec: number): string {
  if (!isFinite(remainingSec) || remainingSec < 0) return "-";
  const arrival = new Date(Date.now() + remainingSec * 1000);
  return arrival.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function stripHtml(html: string): string {
  if (typeof window === "undefined") return html.replace(/<[^>]+>/g, "");
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}
function ManeuverIcon({
  maneuver,
  className = "w-7 h-7",
}: {
  maneuver?: string;
  className?: string;
}) {
  switch (maneuver) {
    case "turn-left":
    case "turn-sharp-left":
      return <CornerUpLeft className={className} />;
    case "turn-slight-left":
    case "ramp-left":
    case "fork-left":
    case "keep-left":
      return <ArrowUpLeft className={className} />;
    case "turn-right":
    case "turn-sharp-right":
      return <CornerUpRight className={className} />;
    case "turn-slight-right":
    case "ramp-right":
    case "fork-right":
    case "keep-right":
      return <ArrowUpRight className={className} />;
    case "uturn-left":
      return <RotateCcw className={className} />;
    case "uturn-right":
      return <RotateCw className={className} />;
    case "roundabout-left":
      return <RotateCcw className={className} />;
    case "roundabout-right":
      return <RotateCw className={className} />;
    case "merge":
    case "straight":
      return <ArrowUp className={className} />;
    default:
      return <ArrowUp className={className} />;
  }
}
function DirectionsLoader({
  origin,
  destination,
  waypoints,
  travelMode,
  onResult,
  onError,
}: {
  origin: LatLng | null;
  destination: LatLng | null;
  waypoints: LatLng[];
  travelMode: "WALKING" | "DRIVING";
  onResult: (res: google.maps.DirectionsResult | null) => void;
  onError?: (err: any) => void;
}) {
  const routesLib = useMapsLibrary("routes");
  const serviceRef = useRef<google.maps.DirectionsService | null>(null);
  useEffect(() => {
    if (!routesLib) return;
    serviceRef.current = new routesLib.DirectionsService();
  }, [routesLib]);
  useEffect(() => {
    const service = serviceRef.current;
    if (!service) return;
    if (!origin || !destination) {
      onResult(null);
      return;
    }
    let cancelled = false;
    service
      .route({
        origin,
        destination,
        waypoints: waypoints.map((w) => ({ location: w, stopover: true })),
        travelMode:
          travelMode === "DRIVING"
            ? google.maps.TravelMode.DRIVING
            : google.maps.TravelMode.WALKING,
        optimizeWaypoints: false,
      })
      .then((res) => {
        if (!cancelled) onResult(res);
      })
      .catch((err) => {
        if (!cancelled) {
          onResult(null);
          onError?.(err);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [
    origin?.lat,
    origin?.lng,
    destination?.lat,
    destination?.lng,
    JSON.stringify(waypoints),
    travelMode,
    routesLib,
  ]);
  return null;
}
function RouteRenderer({ directions }: { directions: google.maps.DirectionsResult | null }) {
  const map = useMap();
  const routesLib = useMapsLibrary("routes");
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  useEffect(() => {
    if (!routesLib || !map) return;
    const r = new routesLib.DirectionsRenderer({
      map,
      suppressMarkers: true,
      preserveViewport: true,
      polylineOptions: {
        strokeColor: "#2563eb",
        strokeWeight: 6,
        strokeOpacity: 0.85,
      },
    });
    rendererRef.current = r;
    return () => {
      r.setMap(null);
      rendererRef.current = null;
    };
  }, [routesLib, map]);
  useEffect(() => {
    const r = rendererRef.current;
    if (!r) return;
    if (directions) {
      r.setDirections(directions);
      r.setMap(map);
    } else {
      r.setMap(null);
    }
  }, [directions, map]);
  return null;
}
function FitBounds({ points, active }: { points: LatLng[]; active: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!active) return;
    if (!map || points.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    points.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds, { top: 80, right: 40, bottom: 200, left: 40 });
  }, [map, points, active]);
  return null;
}
function FollowUser({
  userPos,
  heading,
  active,
  zoom = 17,
}: {
  userPos: LatLng | null;
  heading: number | null;
  active: boolean;
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (!active || !map || !userPos) return;
    map.panTo(userPos);
    if ((map.getZoom() || 0) < zoom) map.setZoom(zoom);
    if (heading !== null && !isNaN(heading)) {
      try {
        map.setHeading(heading);
      } catch {}
    }
  }, [map, userPos?.lat, userPos?.lng, heading, active, zoom]);
  return null;
}
function StepTracker({
  userPos,
  steps,
  currentStepIndex,
  onAdvance,
  onArrive,
}: {
  userPos: LatLng | null;
  steps: google.maps.DirectionsStep[];
  currentStepIndex: number;
  onAdvance: (next: number) => void;
  onArrive: () => void;
}) {
  const geometry = useMapsLibrary("geometry");
  useEffect(() => {
    if (!geometry || !userPos || steps.length === 0) return;
    const step = steps[currentStepIndex];
    if (!step) return;
    const end = step.end_location;
    if (!end) return;
    const dist = geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(userPos.lat, userPos.lng),
      end
    );
    const isLast = currentStepIndex >= steps.length - 1;
    if (isLast) {
      if (dist < ARRIVAL_THRESHOLD_M) onArrive();
    } else if (dist < STEP_ADVANCE_THRESHOLD_M) {
      onAdvance(currentStepIndex + 1);
    }
  }, [geometry, userPos?.lat, userPos?.lng, currentStepIndex, steps, onAdvance, onArrive]);
  return null;
}
export default function ActiveTripNavOverlay() {
  const { activeTrip, activeTripId, setActiveTrip } = useTrip();
  const pathname = usePathname() || "";
  const [expanded, setExpanded] = useState(false);
  const [isEndingConfirmOpen, setIsEndingConfirmOpen] = useState(false);
  const [userPos, setUserPos] = useState<LatLng | null>(null);
  const [userHeading, setUserHeading] = useState<number | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [targetPlaceIndex, setTargetPlaceIndex] = useState<number | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [navigating, setNavigating] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [travelMode, setTravelMode] = useState<"WALKING" | "DRIVING">("WALKING");
  const watchIdRef = useRef<number | null>(null);
  const hiddenRoutes = [
    "/plan-trip",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/onboarding",
  ];
  const shouldRender =
    !!activeTripId && !!activeTrip && !hiddenRoutes.some((p) => pathname.startsWith(p));
  useEffect(() => {
    if (!shouldRender || !expanded) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("Geolocation is not supported in this browser.");
      return;
    }
    const onOk: PositionCallback = (pos) => {
      setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      if (typeof pos.coords.heading === "number" && !isNaN(pos.coords.heading)) {
        setUserHeading(pos.coords.heading);
      }
      setGeoError(null);
    };
    const onFail: PositionErrorCallback = (err) => {
      setGeoError(err.message || "Unable to read location.");
    };
    watchIdRef.current = navigator.geolocation.watchPosition(onOk, onFail, {
      enableHighAccuracy: true,
      maximumAge: 5_000,
      timeout: 20_000,
    });
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [shouldRender, expanded]);
  const allDays = useMemo(() => {
    if (!activeTrip?.itinerary) return [];
    return activeTrip.itinerary as any[];
  }, [activeTrip]);
  const dayPlaces = useMemo<PlaceRef[]>(() => {
    const day = allDays[selectedDayIndex];
    if (!day?.places) return [];
    return (day.places as any[])
      .map((p, pi) => ({
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        start_time: p.start_time,
        category: p.category,
        dayIndex: selectedDayIndex,
        placeIndex: pi,
      }))
      .filter((p) => typeof p.lat === "number" && typeof p.lng === "number");
  }, [allDays, selectedDayIndex]);
  const targetPlace = useMemo<PlaceRef | null>(() => {
    if (targetPlaceIndex === null) return dayPlaces[0] || null;
    return dayPlaces[targetPlaceIndex] || dayPlaces[0] || null;
  }, [dayPlaces, targetPlaceIndex]);
  const routeOrigin = userPos;
  const routeDestination = targetPlace ? { lat: targetPlace.lat, lng: targetPlace.lng } : null;
  const boundsPoints = useMemo<LatLng[]>(() => {
    const pts: LatLng[] = [];
    if (userPos) pts.push(userPos);
    dayPlaces.forEach((p) => pts.push({ lat: p.lat, lng: p.lng }));
    return pts;
  }, [userPos, dayPlaces]);
  useEffect(() => {
    setCurrentStepIndex(0);
    setArrived(false);
  }, [targetPlace?.lat, targetPlace?.lng]);
  const steps = useMemo<google.maps.DirectionsStep[]>(() => {
    const route = directions?.routes?.[0];
    const leg = route?.legs?.[0];
    return (leg?.steps as google.maps.DirectionsStep[]) || [];
  }, [directions]);
  const currentStep = steps[currentStepIndex];
  const nextStep = steps[currentStepIndex + 1];
  const remainingMeters = useMemo(() => {
    if (steps.length === 0) return 0;
    return steps.slice(currentStepIndex).reduce((acc, s) => acc + (s.distance?.value || 0), 0);
  }, [steps, currentStepIndex]);
  const remainingSeconds = useMemo(() => {
    if (steps.length === 0) return 0;
    return steps.slice(currentStepIndex).reduce((acc, s) => acc + (s.duration?.value || 0), 0);
  }, [steps, currentStepIndex]);
  const handleStartNav = useCallback(() => {
    if (!targetPlace) return;
    setCurrentStepIndex(0);
    setArrived(false);
    setNavigating(true);
  }, [targetPlace]);
  const handleStopNav = useCallback(() => {
    setNavigating(false);
    setArrived(false);
  }, []);
  const handleArrive = useCallback(() => {
    setArrived(true);
  }, []);
  const handleAdvanceStep = useCallback((next: number) => {
    setCurrentStepIndex((cur) => (next > cur ? next : cur));
  }, []);
  const handleNextStop = useCallback(() => {
    setArrived(false);
    setCurrentStepIndex(0);
    if (targetPlaceIndex === null) {
      if (dayPlaces.length > 1) setTargetPlaceIndex(1);
      else setNavigating(false);
      return;
    }
    if (targetPlaceIndex + 1 < dayPlaces.length) {
      setTargetPlaceIndex(targetPlaceIndex + 1);
    } else {
      setNavigating(false);
    }
  }, [targetPlaceIndex, dayPlaces.length]);
  const handleRecalculate = useCallback(() => {
    if (!targetPlace) return;
    setCurrentStepIndex(0);
    setDirections(null);
  }, [targetPlace]);

  const handleEndVoyageConfirm = () => {
    setActiveTrip(null);
    setExpanded(false);
    setIsEndingConfirmOpen(false);
  };

  if (!shouldRender) return null;
  const instructionText = currentStep ? stripHtml(currentStep.instructions || "") : "";
  const distanceToTurn = currentStep?.distance?.value ?? 0;
  const totalSteps = steps.length;
  return (
    <>
      <Modal
        isOpen={isEndingConfirmOpen}
        onClose={() => setIsEndingConfirmOpen(false)}
        title="End Voyage?"
      >
        <div className="space-y-6">
          <p className="text-gray-500 font-medium">
            Are you sure you want to end this voyage tracking? Your progress will be saved in your
            archive.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEndingConfirmOpen(false)}
              className="sm:flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEndVoyageConfirm}
              className="sm:flex-1 bg-blue-600 hover:bg-blue-700 shadow-blue-200 text-white"
            >
              End Voyage
            </Button>
          </div>
        </div>
      </Modal>

      <AnimatePresence>
        {!expanded && (
          <motion.button
            key="mini"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            onClick={() => setExpanded(true)}
            className="fixed bottom-[96px] z-[350] bg-blue-600/90 backdrop-blur-xl border border-white/10 text-white px-5 py-4 rounded-2xl shadow-2xl shadow-blue-500/30 flex items-center gap-3 hover:bg-blue-700 active:scale-95"
            style={{ right: "1.5rem", left: "auto" }}
            id="active-trip-nav-mini"
            data-lenis-prevent
            aria-label="Open active voyage navigation"
          >
            <div className="relative w-2 h-2">
              <span className="absolute inset-0 bg-emerald-400 rounded-full animate-ping" />
              <span className="absolute inset-0 bg-emerald-400 rounded-full" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[8px] font-black uppercase tracking-[0.25em] opacity-70">
                Active voyage
              </span>
              <span className="text-xs font-black uppercase tracking-tight truncate max-w-[180px]">
                {activeTrip!.title}
              </span>
            </div>
            <Navigation className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[360] bg-gray-900/90 backdrop-blur-sm flex items-stretch"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative flex-1 flex flex-col md:flex-row bg-white m-0 md:m-6 md:rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              {!navigating && (
                <aside className="w-full md:w-[340px] lg:w-[380px] shrink-0 bg-white border-b md:border-b-0 md:border-r border-gray-100 flex flex-col">
                  <header className="px-6 py-5 flex items-center justify-between border-b border-gray-50">
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em]">
                        Live voyage
                      </p>
                      <h2 className="text-xl font-black tracking-tight text-gray-900 truncate">
                        {activeTrip!.title}
                      </h2>
                    </div>
                    <button
                      onClick={() => setExpanded(false)}
                      className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500"
                      aria-label="Minimise overlay"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </header>
                  {geoError && (
                    <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold text-rose-700 leading-snug">{geoError}</p>
                    </div>
                  )}
                  {allDays.length > 0 && (
                    <div className="px-6 py-4 border-b border-gray-50 flex gap-2 overflow-x-auto no-scrollbar">
                      {allDays.map((day: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedDayIndex(idx);
                            setTargetPlaceIndex(null);
                          }}
                          className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest whitespace-nowrap transition-all ${
                            selectedDayIndex === idx
                              ? "bg-gray-900 text-white"
                              : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          Day {day.day ?? idx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 custom-scrollbar">
                    {dayPlaces.length === 0 && (
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest text-center py-12">
                        No geolocated places for this day.
                      </p>
                    )}
                    {dayPlaces.map((p, i) => {
                      const isTarget =
                        targetPlace?.placeIndex === p.placeIndex &&
                        targetPlace?.dayIndex === p.dayIndex;
                      return (
                        <button
                          key={`${p.dayIndex}-${p.placeIndex}`}
                          onClick={() => setTargetPlaceIndex(i)}
                          className={`w-full text-left p-4 rounded-2xl transition-all flex items-center gap-3 border ${
                            isTarget
                              ? "bg-blue-50 border-blue-200 shadow-sm"
                              : "bg-white border-gray-100 hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black ${
                              isTarget ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate">{p.name}</p>
                            {p.start_time && (
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                {p.start_time}
                              </p>
                            )}
                          </div>
                          <ChevronRight
                            className={`w-4 h-4 ${isTarget ? "text-blue-600" : "text-gray-300"}`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <footer className="px-6 py-5 border-t border-gray-50 space-y-4">
                    <div className="flex bg-gray-50 p-1.5 rounded-2xl gap-1">
                      <button
                        onClick={() => setTravelMode("WALKING")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${travelMode === "WALKING" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                      >
                        <Footprints className="w-3.5 h-3.5" /> Walking
                      </button>
                      <button
                        onClick={() => setTravelMode("DRIVING")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${travelMode === "DRIVING" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                      >
                        <Car className="w-3.5 h-3.5" /> Driving
                      </button>
                    </div>
                    <button
                      onClick={handleStartNav}
                      disabled={!targetPlace || !userPos}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" /> Start navigation
                    </button>
                    {!userPos && !geoError && (
                      <p className="text-[9px] text-gray-400 text-center font-bold uppercase tracking-widest">
                        Waiting for your location…
                      </p>
                    )}
                    <button
                      onClick={() => setIsEndingConfirmOpen(true)}
                      className="w-full py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest text-rose-600 hover:bg-rose-50 transition-all"
                    >
                      End voyage
                    </button>
                  </footer>
                </aside>
              )}
              <div className="relative flex-1 bg-gray-100 min-h-[50vh]">
                {API_KEY ? (
                  <APIProvider apiKey={API_KEY}>
                    <Map
                      defaultCenter={{ lat: 52.237, lng: 21.017 }}
                      defaultZoom={7}
                      gestureHandling="greedy"
                      disableDefaultUI={navigating}
                      style={{ width: "100%", height: "100%" }}
                    >
                      <FitBounds points={boundsPoints} active={!navigating} />
                      <FollowUser
                        userPos={userPos}
                        heading={userHeading}
                        active={navigating}
                        zoom={17}
                      />
                      <DirectionsLoader
                        origin={routeOrigin}
                        destination={routeDestination}
                        waypoints={[]}
                        travelMode={travelMode}
                        onResult={setDirections}
                        onError={(err) =>
                          console.warn("[Voyaz] directions failed:", err?.message || err)
                        }
                      />
                      <RouteRenderer directions={directions} />
                      {navigating && (
                        <StepTracker
                          userPos={userPos}
                          steps={steps}
                          currentStepIndex={currentStepIndex}
                          onAdvance={handleAdvanceStep}
                          onArrive={handleArrive}
                        />
                      )}
                      {userPos && (
                        <Marker
                          position={userPos}
                          title="You are here"
                          icon={
                            {
                              path: google.maps.SymbolPath.CIRCLE,
                              scale: 9,
                              fillColor: "#2563eb",
                              fillOpacity: 1,
                              strokeColor: "#ffffff",
                              strokeWeight: 3,
                            } as any
                          }
                        />
                      )}
                      {!navigating &&
                        dayPlaces.map((p, i) => (
                          <Marker
                            key={`${p.dayIndex}-${p.placeIndex}`}
                            position={{ lat: p.lat, lng: p.lng }}
                            onClick={() => setTargetPlaceIndex(i)}
                            label={{
                              text: String(i + 1),
                              color: "white",
                              fontWeight: "bold",
                              fontSize: "13px",
                            }}
                          />
                        ))}
                      {navigating && targetPlace && (
                        <Marker
                          position={{ lat: targetPlace.lat, lng: targetPlace.lng }}
                          label={{
                            text: "★",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "14px",
                          }}
                        />
                      )}
                    </Map>
                  </APIProvider>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                    <p className="font-black text-rose-500 uppercase tracking-widest text-xs mb-2">
                      Google Maps key missing
                    </p>
                    <p className="text-gray-500 text-xs font-medium max-w-sm">
                      Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment to enable live
                      navigation.
                    </p>
                  </div>
                )}
                {navigating && (
                  <>
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="absolute top-4 left-4 right-4 z-10 flex items-center gap-3"
                    >
                      <div className="flex-1 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 px-5 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em]">
                            ETA
                          </p>
                          <p className="text-lg font-black text-gray-900 leading-tight">
                            {formatETA(remainingSeconds)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em]">
                            {formatDuration(remainingSeconds)}
                          </p>
                          <p className="text-lg font-black text-blue-600 leading-tight">
                            {formatDistance(remainingMeters)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleStopNav}
                        className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-2xl hover:bg-rose-700 transition-all"
                        aria-label="End navigation"
                      >
                        <Square className="w-4 h-4 fill-white" />
                      </button>
                    </motion.div>
                    <AnimatePresence mode="wait">
                      {arrived ? (
                        <motion.div
                          key="arrived"
                          initial={{ y: 80, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 80, opacity: 0 }}
                          className="absolute bottom-6 left-4 right-4 z-10 bg-emerald-600 text-white rounded-3xl shadow-2xl p-5 flex items-center gap-4"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
                            <Flag className="w-7 h-7" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-black uppercase tracking-[0.25em] opacity-80">
                              Arrived
                            </p>
                            <p className="text-base font-black truncate">{targetPlace?.name}</p>
                          </div>
                          {targetPlaceIndex !== null && targetPlaceIndex + 1 < dayPlaces.length ? (
                            <button
                              onClick={handleNextStop}
                              className="bg-white text-emerald-700 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-all"
                            >
                              Next stop
                            </button>
                          ) : (
                            <button
                              onClick={handleStopNav}
                              className="bg-white text-emerald-700 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-all"
                            >
                              Done
                            </button>
                          )}
                        </motion.div>
                      ) : currentStep ? (
                        <motion.div
                          key={`step-${currentStepIndex}`}
                          initial={{ y: 80, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 80, opacity: 0 }}
                          className="absolute bottom-6 left-4 right-4 z-10 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
                        >
                          <div className="p-5 flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                              <ManeuverIcon
                                maneuver={(currentStep as any).maneuver}
                                className="w-8 h-8"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-2xl font-black text-blue-600 leading-none">
                                {formatDistance(distanceToTurn)}
                              </p>
                              <p className="text-sm font-bold text-gray-900 leading-tight mt-1 line-clamp-2">
                                {instructionText}
                              </p>
                            </div>
                            <button
                              onClick={handleRecalculate}
                              className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 shrink-0"
                              aria-label="Recalculate route"
                              title="Recalculate"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {nextStep && (
                            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
                              <ManeuverIcon
                                maneuver={(nextStep as any).maneuver}
                                className="w-4 h-4 text-gray-500 shrink-0"
                              />
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate">
                                Then {stripHtml(nextStep.instructions || "")}
                              </p>
                            </div>
                          )}
                          <div className="px-5 py-2 bg-white text-center border-t border-gray-50">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em]">
                              Step {currentStepIndex + 1} / {totalSteps} · heading to{" "}
                              {targetPlace?.name}
                            </p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="loading"
                          initial={{ y: 80, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 80, opacity: 0 }}
                          className="absolute bottom-6 left-4 right-4 z-10 bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 flex items-center gap-3"
                        >
                          <LocateFixed className="w-5 h-5 text-blue-600 animate-pulse" />
                          <p className="text-sm font-bold text-gray-700">Calculating route…</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
