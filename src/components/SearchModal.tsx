"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaCompass,
  FaHistory,
  FaArrowRight,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { useTrips, Trip } from "@/hooks/useTrips";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Profile } from "./settings/types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserResult extends Profile {
  id: string;
}

import { useScrollLock } from "@/hooks/useScrollLock";

// ... (inside the component)

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const tripsOptions = useMemo(() => ({ mode: "discovery" as const }), []);
  const { trips, isLoading: isTripsLoading } = useTrips(tripsOptions);

  const [query, setQuery] = useState("");
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = useMemo(() => createClient(), []);

  useScrollLock(isOpen);

  const tripResults = useMemo(() => {
    // ...
    if (!query.trim()) return [];
    const searchLower = query.toLowerCase();
    return trips
      .filter(
        (trip) =>
          trip.title.toLowerCase().includes(searchLower) ||
          trip.vibe.toLowerCase().includes(searchLower) ||
          trip.itinerary?.some((day) =>
            day.places?.some((p) => p.name.toLowerCase().includes(searchLower))
          )
      )
      .slice(0, 5);
  }, [query, trips]);

  const totalResultsCount = tripResults.length + userResults.length;

  // Sync selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle modal open/close states
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setUserResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // User search effect
  useEffect(() => {
    const searchUsers = async () => {
      if (!query.trim() || query.length < 2) {
        setUserResults([]);
        return;
      }
      setIsSearchingUsers(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, first_name, last_name, avatar_url, bio")
          .or(`username.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
          .limit(5);
        if (error) throw error;
        setUserResults((data as UserResult[]) || []);
      } catch (err) {
        console.error("User search failed:", err);
      } finally {
        setIsSearchingUsers(false);
      }
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [query, supabase]);

  const handleSelectTrip = (trip: Trip) => {
    router.push(`/trips?id=${trip.id}`);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex((prev) => (prev + 1) % (totalResultsCount || 1));
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prev) => (prev - 1 + (totalResultsCount || 1)) % (totalResultsCount || 1));
    } else if (e.key === "Enter") {
      if (selectedIndex < tripResults.length) {
        handleSelectTrip(tripResults[selectedIndex]);
      } else {
        const userIdx = selectedIndex - tripResults.length;
        const user = userResults[userIdx];
        if (user) router.push(`/profile/${user.id}`);
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const trending = trips.slice(0, 4);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] md:pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-[#0a0a0a]/90 border border-white/10 rounded-[32px] shadow-[0_32px_128px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="relative p-6 border-b border-white/5 bg-white/[0.02]">
                <FaSearch className="absolute left-10 top-1/2 -translate-y-1/2 text-white/20 text-xl" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Where or who would you like to find?"
                  maxLength={50}
                  className="w-full bg-transparent pl-16 pr-12 py-4 text-xl font-bold text-white placeholder-white/20 outline-none"
                />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-3">
                  {isSearchingUsers && (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              </div>
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-4 space-y-6">
                {query.trim() === "" ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                      <div className="flex items-center gap-2">
                        <FaCompass className="text-blue-500 text-sm animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                          Trending Destinations
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-white/20">Updated hourly</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 px-2">
                      {trending.map((trip) => (
                        <button
                          key={trip.id}
                          onClick={() => setQuery(trip.title)}
                          className="group relative h-32 rounded-3xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-500"
                        >
                          <motion.img
                            whileHover={{ scale: 1.1 }}
                            src={trip.image}
                            alt={trip.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                          <div className="absolute bottom-4 left-5">
                            <p className="text-base font-black text-white leading-tight">
                              {trip.title}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : tripResults.length > 0 || userResults.length > 0 ? (
                  <>
                    {tripResults.length > 0 && (
                      <div className="space-y-2">
                        <div className="px-4 mb-3">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                            Destinations
                          </span>
                        </div>
                        {tripResults.map((trip, idx) => (
                          <button
                            key={trip.id}
                            onClick={() => handleSelectTrip(trip)}
                            className={`w-full flex items-center gap-5 p-4 rounded-[24px] transition-all border group text-left ${
                              selectedIndex === idx
                                ? "bg-white/10 border-white/20 shadow-2xl backdrop-blur-md"
                                : "border-transparent hover:bg-white/[0.03]"
                            }`}
                          >
                            <div className="relative w-20 h-14 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                              <img
                                src={trip.image}
                                alt={trip.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-black text-base text-white truncate uppercase tracking-tight">
                                {trip.title}
                              </h4>
                              <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">
                                {trip.vibe}
                              </p>
                            </div>
                            <FaArrowRight
                              className={`text-[10px] transition-all ${selectedIndex === idx ? "text-blue-500 translate-x-1" : "text-white/10"}`}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                    {userResults.length > 0 && (
                      <div className="space-y-2 mt-6">
                        <div className="px-4 mb-3">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                            Travelers
                          </span>
                        </div>
                        {userResults.map((user, idx) => {
                          const globalIdx = tripResults.length + idx;
                          return (
                            <Link
                              key={user.id}
                              href={`/profile/${user.id}`}
                              onClick={onClose}
                              className={`flex items-center gap-5 p-4 rounded-[24px] transition-all border group ${
                                selectedIndex === globalIdx
                                  ? "bg-white/10 border-white/20 shadow-2xl backdrop-blur-md"
                                  : "border-transparent hover:bg-white/[0.03]"
                              }`}
                            >
                              <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0 bg-gray-900">
                                <img
                                  src={
                                    user.avatar_url ||
                                    `https://ui-avatars.com/api/?name=${user.username}&background=random`
                                  }
                                  alt={user.username}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-black text-base text-white truncate uppercase tracking-tight">
                                  {user.username}
                                </h4>
                                <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest line-clamp-1">
                                  {user.bio || "No travel bio yet"}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[8px] font-black text-white/30 uppercase tracking-widest">
                                  Profile
                                </span>
                                <FaUser
                                  className={`text-[10px] transition-all ${selectedIndex === globalIdx ? "text-blue-500" : "text-white/10"}`}
                                />
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                      <FaSearch className="text-white/10 text-3xl" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">
                        No results found for &quot;{query}&quot;
                      </p>
                      <p className="text-sm text-white/30">
                        Search for destinations or other travelers.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 bg-white/[0.01] border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-white/20 uppercase tracking-widest">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1.5">
                    <kbd className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-[9px]">
                      ENTER
                    </kbd>{" "}
                    TO VIEW
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-[9px]">
                      &uarr;&darr;
                    </kbd>{" "}
                    TO NAVIGATE
                  </span>
                </div>
                <span className="flex items-center gap-1.5">
                  <kbd className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-[9px]">
                    ESC
                  </kbd>{" "}
                  TO CLOSE
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
export default SearchModal;
