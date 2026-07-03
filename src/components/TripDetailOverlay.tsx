"use client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import Lenis from "lenis";
import { useSmoothScroll } from "@/context/SmoothScrollContext";
import { useRouter } from "next/navigation";
import { Trip } from "@/hooks/useTrips";
import {
  FaTimes,
  FaCloudSun,
  FaBolt,
  FaMagic,
  FaLocationArrow,
  FaHeart,
  FaShareAlt,
  FaRobot,
  FaUsers,
  FaCodeBranch,
  FaExternalLinkAlt,
  FaChevronLeft,
} from "react-icons/fa";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useFavourites } from "@/context/FavouritesContext";
import { useTrip } from "@/context/TripContext";
import { TripShareModal } from "@/features/trips/components/TripShareModal";
import { Trip as FeaturesTrip } from "@/features/trips/types";
import { GroupChat } from "@/features/trips/components/GroupChat";
import { useAuth } from "@/context/AuthContext";
import { usePreferences } from "@/context/PreferencesContext";
import { createClient } from "@/utils/supabase/client";

interface Props {
  trip: Trip;
  onClose: () => void;
}

interface ForkedFromInfo {
  tripTitle: string;
  tripId: string;
  ownerUsername: string;
  ownerAvatar: string | null;
  ownerId: string;
}

const GoogleMapComponent = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center font-black text-gray-400">
      LOADING AI MAP...
    </div>
  ),
});

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case "culture":
      return <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">🏛️</div>;
    case "food":
      return <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">☕</div>;
    case "nature":
      return <div className="p-2 bg-green-100 text-green-600 rounded-lg">🌿</div>;
    case "nightlife":
      return <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">✨</div>;
    default:
      return null;
  }
};

// ── "Forked from" banner ───────────────────────────────────────────────────────
const ForkedFromBanner = ({ info }: { info: ForkedFromInfo }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className="mx-6 md:mx-12 mt-6 flex items-center gap-4 px-6 py-4 rounded-[1.5rem] bg-emerald-50 border border-emerald-100"
  >
    {/* Avatar */}
    <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-100 border-2 border-emerald-200 shrink-0">
      <img
        src={
          info.ownerAvatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(info.ownerUsername)}&background=d1fae5&color=065f46`
        }
        alt={info.ownerUsername}
        className="w-full h-full object-cover"
      />
    </div>

    {/* Text */}
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1.5 mb-0.5">
        <FaCodeBranch size={9} /> Forked from
      </p>
      <p className="text-sm font-bold text-gray-900 truncate">
        <span className="text-emerald-700">@{info.ownerUsername}</span>
        <span className="text-gray-400 font-medium mx-1.5">·</span>
        <span>{info.tripTitle}</span>
      </p>
    </div>
  </motion.div>
);

// ── Main component ─────────────────────────────────────────────────────────────
const TripDetailOverlay = ({ trip, onClose }: Props) => {
  useScrollLock(true);
  const router = useRouter();
  const { user } = useAuth();
  const { formatCurrency, formatTemperature } = usePreferences();
  const { isFavourite, toggleFavourite } = useFavourites();
  const { isTracking, toggleTracking } = useTrip();
  const active = isFavourite(trip.id);
  const tracking = isTracking(trip.id);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [forkedFromInfo, setForkedFromInfo] = useState<ForkedFromInfo | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { lenis: globalLenis } = useSmoothScroll();
  const isOwner = user?.id === (trip as any).user_id;
  const forkedFromId: string | null = (trip as any).forked_from_id || null;
  const supabase = createClient();

  // ── Fetch participants ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchParticipants = async () => {
      const { data } = await supabase
        .from("trip_shares")
        .select("profiles(id, username, avatar_url)")
        .eq("trip_id", trip.id);
      if (data) setParticipants(data.map((d) => d.profiles).filter(Boolean));
    };
    fetchParticipants();
  }, [trip.id]);

  // ── Fetch "forked from" info ──────────────────────────────────────────────
  useEffect(() => {
    if (!forkedFromId) return;
    const fetchForkedFrom = async () => {
      // Get the original trip
      const { data: originalTrip, error: tripError } = await supabase
        .from("trips")
        .select("id, title, user_id, is_template")
        .eq("id", forkedFromId)
        .maybeSingle();

      if (tripError || !originalTrip) return;

      // Case: Forked from a system template (no user_id)
      if (!originalTrip.user_id && (originalTrip as any).is_template) {
        setForkedFromInfo({
          tripId: originalTrip.id,
          tripTitle: originalTrip.title,
          ownerId: "system",
          ownerUsername: "Voyaz Official",
          ownerAvatar: null,
        });
        return;
      }

      if (!originalTrip.user_id) return;

      // Get the owner's profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("id", originalTrip.user_id)
        .maybeSingle();

      if (profileError || !profile) return;

      setForkedFromInfo({
        tripId: originalTrip.id,
        tripTitle: originalTrip.title,
        ownerId: profile.id,
        ownerUsername: profile.username || "voyager",
        ownerAvatar: profile.avatar_url,
      });
    };
    fetchForkedFrom();
  }, [forkedFromId]);

  // ── Local smooth scroll ───────────────────────────────────────────────────
  useEffect(() => {
    if (globalLenis) globalLenis.stop();
    const localLenis = new Lenis({
      wrapper: wrapperRef.current || undefined,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    function raf(time: number) {
      localLenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => {
      localLenis.destroy();
      if (globalLenis) globalLenis.start();
    };
  }, [globalLenis]);

  const handleEditAI = () => router.push(`/plan-trip?tripId=${trip.id}`);

  const featuresTrip: FeaturesTrip = {
    ...trip,
    id: String(trip.id),
    user_id: (trip as any).user_id || "",
    created_at: new Date().toISOString(),
    summary: trip.description,
    destination: trip.title,
    places_count: trip.places,
    price_total: trip.price,
    visibility: (trip as any).visibility || "public",
  };

  return (
    <motion.div
      ref={wrapperRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white overflow-y-auto overflow-x-hidden"
    >
      <TripShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        trip={featuresTrip}
        onForkSuccess={() => setIsShareModalOpen(false)}
      />
      <GroupChat tripId={String(trip.id)} tripTitle={trip.title} />

      {/* ── Hero image ── */}
      <motion.div
        layoutId={`trip-card-${trip.id}`}
        className="relative w-full h-[50vh] md:h-[65vh] overflow-hidden"
      >
        <motion.div layoutId={`trip-image-container-${trip.id}`} className="absolute inset-0">
          <Image
            src={trip.image || "/images/generated-trips.png"}
            alt={trip.title}
            fill
            className="object-cover brightness-[0.8] contrast-[1.1]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white" />
        </motion.div>

        {/* Top bar */}
        <div className="absolute top-0 left-0 w-full p-6 md:p-10 flex justify-between items-start z-50">
          <button
            onClick={onClose}
            className="group w-14 h-14 rounded-3xl bg-black/20 hover:bg-black/40 backdrop-blur-3xl border border-white/20 flex items-center justify-center text-white transition-all shadow-2xl active:scale-95"
          >
            <FaChevronLeft
              fontSize={22}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          </button>

          <div className="flex flex-col items-end gap-2">
            {/* Template / Forked badge */}
            {!(trip as any).user_id && (trip as any).is_template ? (
              <div className="px-4 py-2 rounded-2xl bg-blue-600/80 backdrop-blur-xl border border-blue-400/40 text-white flex items-center gap-2">
                <FaMagic className="text-blue-200" size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Official Template
                </span>
              </div>
            ) : forkedFromId ? (
              <div className="px-4 py-2 rounded-2xl bg-emerald-500/80 backdrop-blur-xl border border-emerald-400/40 text-white flex items-center gap-2">
                <FaCodeBranch className="text-emerald-200" size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Forked Trip
                </span>
              </div>
            ) : null}
            {trip.showWeather && trip.weather && (
              <div className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 text-white flex items-center gap-3">
                <FaCloudSun className="text-yellow-400" />
                <span className="font-bold">
                  {formatTemperature(trip.weather.temp)} • {trip.weather.condition}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-all"
              >
                <FaShareAlt />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleFavourite(trip.id);
                }}
                className={`w-12 h-12 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all shadow-xl group/fav ${
                  active
                    ? "bg-pink-500 text-white border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.4)]"
                    : "bg-white/20 border-white/30 text-white hover:text-pink-400"
                }`}
              >
                <FaHeart
                  className={`text-xl transition-transform duration-300 ${active ? "scale-110" : "scale-100 group-hover/fav:scale-110"}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Title block */}
        <div className="absolute bottom-12 left-0 w-full px-6 md:px-12 pointer-events-none">
          <motion.div layoutId={`trip-info-${trip.id}`}>
            <h1 className="text-6xl md:text-8xl font-black text-black leading-none mb-4 uppercase tracking-tighter">
              {trip.title}
            </h1>
            <div className="flex gap-4">
              <span className="px-5 py-1.5 rounded-full bg-blue-500 text-white text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20">
                {trip.days} Days
              </span>
              <span className="px-5 py-1.5 rounded-full bg-black text-white text-xs font-black uppercase tracking-[0.2em] shadow-lg">
                {trip.places} Places
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── "Forked from" banner (under hero) ── */}
      {forkedFromInfo && <ForkedFromBanner info={forkedFromInfo} />}

      {/* ── Content grid ── */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 px-6 md:px-12 py-12">
        <div className="lg:col-span-8 space-y-16">
          {/* Trip DNA */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                <FaMagic className="text-blue-500" /> Trip DNA & AI Insights
              </h3>
              {participants.length > 0 && (
                <div className="flex -space-x-3">
                  {participants.map((p, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-4 border-white overflow-hidden bg-gray-100 shadow-sm"
                      title={`@${p?.username}`}
                    >
                      <img
                        src={
                          p?.avatar_url ||
                          `https://ui-avatars.com/api/?name=${p?.username || "User"}`
                        }
                        alt={p?.username || "User"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-4 border-white bg-gray-50 flex items-center justify-center text-gray-400 text-[10px] font-bold shadow-sm">
                    <FaUsers />
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-[2rem] bg-gray-50 border border-gray-100">
                <p className="text-sm font-bold text-gray-500 uppercase mb-2">Energy Level</p>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-black">{trip.energyLevel}</span>
                  <FaBolt
                    className={trip.energyLevel === "High" ? "text-yellow-500" : "text-blue-400"}
                  />
                </div>
              </div>
              <div className="p-8 rounded-[2rem] bg-gray-50 border border-gray-100">
                <p className="text-sm font-bold text-gray-500 uppercase mb-2">Atmosphere</p>
                <span className="text-3xl font-black">{trip.vibe}</span>
              </div>
            </div>

            {/* Price Breakdown */}
            {(trip as any).price_summary && (
              <div className="p-8 rounded-[2rem] bg-blue-50/50 border border-blue-100">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-6">
                  Estimated Cost Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
                      Accommodation
                    </p>
                    <p className="text-xl font-black text-gray-900">
                      {(formatCurrency as any)(
                        (trip as any).price_summary.accommodation_total,
                        "ANY",
                        false
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
                      Activities
                    </p>
                    <p className="text-xl font-black text-gray-900">
                      {(formatCurrency as any)(
                        (trip as any).price_summary.activities_total,
                        "ANY",
                        false
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
                      Food & Drinks
                    </p>
                    <p className="text-xl font-black text-gray-900">
                      {(formatCurrency as any)(
                        (trip as any).price_summary.food_total,
                        "ANY",
                        false
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <p className="mt-8 text-xl text-gray-600 leading-relaxed font-medium max-w-2xl">
              {trip.description}
            </p>
          </section>

          {/* Itinerary */}
          <section>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-10 flex items-center gap-2">
              <FaLocationArrow className="text-blue-500" /> Your Magic Itinerary
            </h3>
            <div className="space-y-16 border-l-2 border-gray-100 ml-6 pl-10 relative">
              {trip.itinerary.map((day, dIdx) => (
                <div key={dIdx} className="space-y-8">
                  <div className="relative">
                    <div className="absolute -left-[54px] top-0 w-8 h-8 rounded-full bg-blue-600 border-4 border-white z-10 shadow-md" />
                    <h4 className="text-xl font-black uppercase tracking-tight text-gray-900">
                      Day {day.day}: {day.theme}
                    </h4>
                  </div>
                  <div className="space-y-10">
                    {day.places.map((place, pIdx) => (
                      <motion.div
                        key={`${dIdx}-${pIdx}`}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: pIdx * 0.1 }}
                        className="relative group"
                      >
                        <div className="absolute -left-[50px] top-2 w-6 h-6 rounded-full bg-white border-2 border-blue-500 z-10 group-hover:scale-125 transition-transform shadow-sm" />
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="shrink-0">
                            <span className="text-sm font-black text-blue-500 block mb-2">
                              {place.start_time}
                            </span>
                            <CategoryIcon category={place.category} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              {place.website_url ? (
                                <a
                                  href={place.website_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-2xl font-black hover:text-blue-600 transition-colors flex items-center gap-2 group/link"
                                >
                                  {place.name}
                                  <FaExternalLinkAlt className="text-sm opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                </a>
                              ) : (
                                <h4 className="text-2xl font-black">{place.name}</h4>
                              )}

                              {(place as any).price_range && (
                                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                                  {(place as any).price_range}
                                </span>
                              )}
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-[10px] font-black uppercase text-blue-600 mb-4">
                              <FaMagic fontSize={10} /> AI Reason
                            </div>
                            <p className="text-gray-500 text-lg leading-relaxed max-w-xl italic">
                              &quot;{place.reason}&quot;
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Map */}
        <div className="lg:col-span-4 space-y-8">
          <div className="rounded-[3rem] overflow-hidden bg-gray-100 aspect-square relative border-8 border-gray-50 shadow-2xl">
            <GoogleMapComponent places={trip.itinerary.flatMap((d) => d.places)} />
            <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-black uppercase shadow-sm z-10">
              Route Overview
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky bottom bar ── */}
      <div className="sticky bottom-8 left-0 w-full px-6 z-50">
        <div className="max-w-5xl mx-auto bg-black/90 backdrop-blur-2xl rounded-[3rem] p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl border border-white/10">
          <div className="flex items-center gap-6 px-6">
            <motion.div layoutId={`trip-price-${trip.id}`} className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-gray-500">Starting from</span>
              <span className="text-2xl font-black text-white leading-none">
                {formatCurrency(trip.price)}
              </span>
            </motion.div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            {isOwner && (
              <button
                onClick={handleEditAI}
                className="flex-1 md:flex-none px-8 py-5 rounded-full bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
              >
                <FaRobot /> Open AI Editor
              </button>
            )}
            <button
              onClick={() =>
                toggleTracking({
                  id: String(trip.id),
                  title: trip.title,
                  itinerary: trip.itinerary,
                  days: trip.days,
                  places: trip.places,
                  energyLevel: trip.energyLevel,
                  image: trip.image || "/images/generated-trips.png",
                  vibe: trip.vibe,
                  description: trip.description,
                  price: trip.price,
                })
              }
              className={`flex-1 md:flex-none px-8 py-5 rounded-full font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3 ${
                tracking
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <FaLocationArrow className={tracking ? "animate-pulse" : ""} />
              {tracking ? "Tracking" : "Track Trip"}
            </button>
          </div>
        </div>
      </div>
      <div className="h-32" />
    </motion.div>
  );
};

export default TripDetailOverlay;
