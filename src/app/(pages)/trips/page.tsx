"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import {
  FaSearch,
  FaChevronRight,
  FaHeart,
  FaWind,
  FaMapMarkerAlt,
  FaCalendarDay,
  FaBolt,
  FaCodeBranch,
  FaLock,
  FaGlobe,
  FaUserFriends,
  FaTrash,
} from "react-icons/fa";
import { useTrips, Trip } from "@/hooks/useTrips";
import { useFavourites } from "@/context/FavouritesContext";
import { useTrip } from "@/context/TripContext";
import { useCountries } from "@/hooks/useCountries";
import { usePreferences } from "@/context/PreferencesContext";
import { getPersonalizedTrip } from "@/utils/tripPersonalizer";
import { useSearchParams } from "next/navigation";
import TripDetailOverlay from "@/components/TripDetailOverlay";
import { useAuth } from "@/context/AuthContext";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

// ── Visibility pill ────────────────────────────────────────────────────────────
const VisibilityPill = ({ visibility }: { visibility?: string }) => {
  if (!visibility || visibility === "public") return null;
  if (visibility === "private")
    return (
      <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-800/80 backdrop-blur-sm rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-sm w-fit">
        <FaLock className="text-[7px]" /> Private
      </span>
    );
  if (visibility === "friends")
    return (
      <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-500/80 backdrop-blur-sm rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-sm w-fit">
        <FaUserFriends className="text-[7px]" /> Friends
      </span>
    );
  return null;
};

// ── Trip Card ──────────────────────────────────────────────────────────────────
const TripCard = ({
  trip,
  onClick,
  onDelete,
  formatCurrency,
}: {
  trip: Trip;
  onClick: () => void;
  onDelete?: () => void;
  formatCurrency: (val: number) => string;
}) => {
  const { isFavourite, toggleFavourite } = useFavourites();
  const { isTracking } = useTrip();
  const active = isFavourite(trip.id);
  const tracked = isTracking(trip.id);
  const isForked = !!(trip as any).forked_from_id;
  const visibility = (trip as any).visibility;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={onClick}
      className={`group relative bg-white rounded-3xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col cursor-pointer ${
        tracked ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-100"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={trip.image || "/images/generated-trips.png"}
          alt={trip.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Top-left badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-900 shadow-sm w-fit">
              {trip.days} Days
            </span>
            <span className="px-3 py-1 bg-gray-900/90 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-sm w-fit">
              {(formatCurrency as any)(trip.price, "ANY", false)}
            </span>
          </div>
          {tracked && (
            <span className="px-3 py-1 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-blue-600/40 w-fit animate-pulse">
              Active
            </span>
          )}
          {isForked && (
            <span className="flex items-center gap-1 px-3 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-sm w-fit">
              <FaCodeBranch className="text-[8px]" /> Forked
            </span>
          )}
          <VisibilityPill visibility={visibility} />
        </div>

        {/* Buttons container */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          {/* Favourite button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavourite(trip.id);
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
              active
                ? "bg-pink-500 text-white shadow-pink-200"
                : "bg-white/90 backdrop-blur-sm text-gray-400 hover:text-pink-500"
            }`}
          >
            <FaHeart className={active ? "scale-110" : "scale-100"} />
          </button>

          {/* Delete button */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-sm text-gray-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
            >
              <FaTrash size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
          {trip.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-1">{trip.description}</p>
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            {trip.energyLevel} Energy
          </span>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-widest">
            View Details <FaChevronRight className="text-[10px]" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────
export default function TripsPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const initialTab = searchParams.get("tab") === "mine" ? "mine" : "explore";
  const [activeTab, setActiveTab] = useState<"explore" | "mine">(initialTab);

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "mine") setActiveTab("mine");
    else if (tab === "explore") setActiveTab("explore");
  }, [searchParams]);

  // Discovery (public) trips
  const { trips: publicTrips, isLoading: isPublicLoading } = useTrips({ mode: "discovery" });
  // Current user's own trips (all visibilities)
  const {
    trips: myTrips,
    isLoading: isMyLoading,
    deleteTrip,
    isDeleting,
  } = useTrips({ mode: "user" });

  const { countries, isLoading: isCountriesLoading } = useCountries();
  const { favouriteIds, toggleFavourite } = useFavourites();
  const { activeTripId, setActiveTrip } = useTrip();
  const { formatCurrency } = usePreferences();

  const [reconstructedTrips, setReconstructedTrips] = useState<Trip[]>([]);
  const [isReconstructing, setIsReconstructing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [isEndingVoyage, setIsEndingVoyage] = useState(false);

  const quickFilters = ["All", "Europe", "Asia", "Americas", "Africa", "Oceania"];

  // Reconstruct old discovery-prefixed favourites
  useEffect(() => {
    const reconstructMissing = async () => {
      if (
        isPublicLoading ||
        isCountriesLoading ||
        publicTrips.length === 0 ||
        countries.length === 0
      )
        return;
      setIsReconstructing(true);
      const newTrips: Trip[] = [];
      for (const favId of favouriteIds) {
        if (typeof favId === "string" && favId.startsWith("discovery-")) {
          if (publicTrips.some((t) => String(t.id) === favId)) continue;
          const parts = favId.split("-");
          if (parts.length < 3) continue;
          const countryName = parts[1];
          const cityName = parts.slice(2).join(" ");
          const country = countries.find((c) => c.name.toLowerCase() === countryName.toLowerCase());
          if (country) {
            const city = country.cities.find(
              (c) => c.toLowerCase() === cityName.toLowerCase().replace(/-/g, " ")
            );
            const personalized = await getPersonalizedTrip({
              activeCountry: country,
              selectedCity: city || cityName,
              trips: publicTrips,
              skipWeather: true,
            });
            if (personalized) newTrips.push(personalized);
          }
        }
      }
      setReconstructedTrips(newTrips);
      setIsReconstructing(false);
    };
    reconstructMissing();
  }, [favouriteIds, publicTrips, countries, isPublicLoading, isCountriesLoading]);

  // "My Voyages" = own trips + favourited-but-not-owned trips, deduped
  const myVoyages = useMemo(() => {
    const combined = [...myTrips];
    const ownedIds = new Set(myTrips.map((t) => String(t.id)));

    // Add favourited discovery trips not owned by user
    const allDiscovery = [...publicTrips, ...reconstructedTrips];
    for (const t of allDiscovery) {
      if (favouriteIds.includes(t.id) && !ownedIds.has(String(t.id))) {
        combined.push(t);
      }
    }
    // Dedupe by id (just in case)
    const seen = new Set<string>();
    return combined.filter((t) => {
      const key = String(t.id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [myTrips, publicTrips, reconstructedTrips, favouriteIds]);

  // Auto-open trip from URL parameter
  useEffect(() => {
    const tripId = searchParams.get("id");
    if (tripId && myVoyages.length > 0 && publicTrips.length > 0) {
      const all = [...publicTrips, ...myVoyages];
      const found = all.find((t) => String(t.id) === String(tripId));
      if (found) {
        setSelectedTrip(found as Trip);
      }
    }
  }, [searchParams, publicTrips, myVoyages]);

  // Active trip for live tracking banner
  const activeTrip = useMemo(() => {
    if (!activeTripId) return null;
    const all = [...publicTrips, ...myTrips, ...reconstructedTrips];
    return all.find((t) => String(t.id) === String(activeTripId)) as Trip | undefined;
  }, [activeTripId, publicTrips, myTrips, reconstructedTrips]);

  // Filtered display trips
  const displayTrips = useMemo(() => {
    const source = activeTab === "explore" ? publicTrips : myVoyages;
    return source.filter((trip) => {
      const title = trip.title || "";
      const vibe = trip.vibe || "";
      const description = trip.description || "";
      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vibe.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase());
      if (activeFilter === "All") return matchesSearch;

      const category = (trip as any).category;
      const matchesFilter =
        category === activeFilter ||
        vibe.includes(activeFilter) ||
        title.includes(activeFilter) ||
        description.includes(activeFilter);

      return matchesSearch && matchesFilter;
    });
  }, [activeTab, publicTrips, myVoyages, searchQuery, activeFilter]);

  const myForksCount = myTrips.filter((t) => !!(t as any).forked_from_id).length;
  const mySavedCount = myVoyages.length - myTrips.length;

  const isLoading =
    activeTab === "explore"
      ? isPublicLoading
      : isMyLoading || isCountriesLoading || isReconstructing;

  const handleEndVoyageConfirm = () => {
    setActiveTrip(null);
    setIsEndingVoyage(false);
  };

  const handleDeleteConfirm = async () => {
    if (!tripToDelete) return;

    const isOwned = myTrips.some((t) => t.id === tripToDelete.id);

    if (isOwned) {
      await deleteTrip(tripToDelete.id);
    } else {
      // It's a favorite, just remove from favorites
      toggleFavourite(tripToDelete.id);
    }

    setTripToDelete(null);
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6 md:px-12">
      <AnimatePresence>
        {selectedTrip && (
          <TripDetailOverlay trip={selectedTrip} onClose={() => setSelectedTrip(null)} />
        )}
      </AnimatePresence>

      <Modal isOpen={isEndingVoyage} onClose={() => setIsEndingVoyage(false)} title="End Voyage?">
        <div className="space-y-6">
          <p className="text-gray-500 font-medium">
            Are you sure you want to end this voyage tracking? Your progress will be saved in your
            archive.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setIsEndingVoyage(false)}
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

      <Modal isOpen={!!tripToDelete} onClose={() => setTripToDelete(null)} title="Are you sure?">
        <div className="space-y-6">
          <p className="text-gray-500 font-medium">
            {myTrips.some((t) => t.id === tripToDelete?.id)
              ? "Do you really want to delete this voyage? This action is permanent and cannot be undone."
              : "Do you want to remove this voyage from your saved list?"}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setTripToDelete(null)} className="sm:flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
              className="sm:flex-1 bg-red-500 hover:bg-red-600 shadow-red-200 text-white"
            >
              {myTrips.some((t) => t.id === tripToDelete?.id)
                ? "Delete Permanently"
                : "Remove from Saved"}
            </Button>
          </div>
        </div>
      </Modal>

      <div className="max-w-7xl mx-auto">
        {/* ── Live tracking banner ── */}
        <AnimatePresence>
          {activeTrip && (
            <motion.section
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-20"
            >
              <div className="relative w-full rounded-[2.5rem] overflow-hidden bg-gray-900 shadow-2xl shadow-blue-900/20">
                <div className="absolute inset-0 opacity-40">
                  <Image
                    src={activeTrip.image}
                    alt=""
                    fill
                    className="object-cover blur-xl scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent" />
                </div>
                <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="px-3 py-1 bg-blue-500 rounded-full text-[10px] font-black uppercase tracking-widest text-white animate-pulse">
                        Live Tracking
                      </div>
                      <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                        Current Adventure
                      </span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">
                      {activeTrip.title}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
                      {[
                        {
                          label: "Progress",
                          value: `Day 1 of ${activeTrip.days}`,
                          Icon: FaCalendarDay,
                          color: "text-blue-400",
                        },
                        {
                          label: "Stops",
                          value: `${activeTrip.places} Planned`,
                          Icon: FaMapMarkerAlt,
                          color: "text-emerald-400",
                        },
                        {
                          label: "Energy",
                          value: activeTrip.energyLevel,
                          Icon: FaBolt,
                          color: "text-orange-400",
                        },
                      ].map(({ label, value, Icon, color }) => (
                        <div
                          key={label}
                          className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5"
                        >
                          <div
                            className={`w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center ${color} shrink-0`}
                          >
                            <Icon />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                              {label}
                            </p>
                            <p className="text-sm font-bold text-white truncate">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 w-full md:w-auto flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setIsEndingVoyage(true)}
                      className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white px-8 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all border border-white/10"
                    >
                      End Voyage
                    </button>
                    <button
                      onClick={() => setSelectedTrip(activeTrip)}
                      className="group flex items-center justify-center gap-4 bg-white text-gray-900 px-10 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                      Open Live Map{" "}
                      <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Header ── */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
              <h1 className="text-5xl font-black tracking-tight text-gray-900 mb-4">
                {activeTab === "explore" ? (
                  <>
                    Explore <span className="text-gray-400">Voyages</span>
                  </>
                ) : (
                  <>
                    My <span className="text-blue-600">Voyages</span>
                  </>
                )}
              </h1>
              <p className="text-gray-400 font-medium max-w-sm">
                {activeTab === "explore"
                  ? "Discover your next adventure from our curated list of destinations."
                  : "Your trips, forked templates, and favourited voyages - all in one place."}
              </p>
            </div>

            {/* Tab switcher */}
            <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100 w-fit">
              <button
                onClick={() => setActiveTab("explore")}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === "explore"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Explore
              </button>
              <button
                onClick={() => setActiveTab("mine")}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === "mine"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                My Voyages
                {myVoyages.length > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      activeTab === "mine"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {myVoyages.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* My Voyages stats bar */}
          {activeTab === "mine" && myVoyages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-3 mb-8"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-2xl">
                <FaGlobe className="text-blue-500 text-xs" />
                <span className="text-[11px] font-black text-gray-700 uppercase tracking-widest">
                  {myTrips.filter((t) => (t as any).visibility === "public").length} Public
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-2xl">
                <FaLock className="text-gray-500 text-xs" />
                <span className="text-[11px] font-black text-gray-700 uppercase tracking-widest">
                  {myTrips.filter((t) => (t as any).visibility === "private").length} Private
                </span>
              </div>
              {myForksCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <FaCodeBranch className="text-emerald-500 text-xs" />
                  <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">
                    {myForksCount} Forked
                  </span>
                </div>
              )}
              {mySavedCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 border border-pink-100 rounded-2xl">
                  <FaHeart className="text-pink-500 text-xs" />
                  <span className="text-[11px] font-black text-pink-700 uppercase tracking-widest">
                    {mySavedCount} Saved
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* Search + filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full max-w-md">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                maxLength={50}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-200 transition-all text-sm font-medium"
              />{" "}
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
              {quickFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeFilter === filter
                      ? "bg-gray-900 text-white"
                      : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* ── Trip grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/5] bg-gray-50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {displayTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                <AnimatePresence mode="popLayout">
                  {displayTrips.map((trip) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      onClick={() => setSelectedTrip(trip)}
                      onDelete={activeTab === "mine" ? () => setTripToDelete(trip) : undefined}
                      formatCurrency={formatCurrency}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-40 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                  {activeTab === "explore" ? (
                    <FaSearch className="text-gray-200 text-2xl" />
                  ) : (
                    <FaWind className="text-gray-200 text-2xl" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {activeTab === "explore" ? "No trips found" : "Nothing here yet"}
                </h3>
                <p className="text-gray-400 text-sm max-w-xs mb-8">
                  {activeTab === "explore"
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "Explore public trips and fork them, or generate your own voyage with AI."}
                </p>
                {activeTab === "mine" && (
                  <button
                    onClick={() => setActiveTab("explore")}
                    className="px-8 py-3 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
                  >
                    Browse Trips
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
