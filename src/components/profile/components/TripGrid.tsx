import React from "react";
import { motion } from "framer-motion";
import { IoTimeOutline, IoLocationOutline } from "react-icons/io5";
import { Trip } from "@/hooks/useTrips";
import { usePreferences } from "@/context/PreferencesContext";

interface TripGridProps {
  trips: Trip[];
  isLoading: boolean;
  username: string;
  avatarUrl?: string;
  onTripClick?: (trip: Trip) => void;
}
export function TripGrid({ trips, isLoading, username, avatarUrl, onTripClick }: TripGridProps) {
  const { formatCurrency } = usePreferences();
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-[32px] overflow-hidden border border-gray-100 p-4 space-y-4 animate-pulse"
          >
            <div className="aspect-[4/5] bg-gray-100 rounded-2xl w-full" />
            <div className="h-6 bg-gray-100 rounded-full w-3/4" />
            <div className="h-4 bg-gray-100 rounded-full w-1/2" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {trips.map((trip) => (
        <motion.div
          key={trip.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -8 }}
          onClick={() => onTripClick?.(trip)}
          className="group relative bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 cursor-pointer"
        >
          <div className="relative aspect-[4/5] overflow-hidden p-3 pb-0">
            <img
              src={trip.image}
              alt={trip.title}
              className="w-full h-full object-cover rounded-[32px] transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[32px] m-3 mb-0" />
            <div className="absolute top-8 left-8 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-4 group-hover:translate-y-0">
              <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-[10px] text-white font-bold">
                <IoTimeOutline size={12} /> {trip.days} Days
              </div>
              <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-[10px] text-white font-bold">
                <IoLocationOutline size={12} /> {trip.places} Places
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="flex items-center justify-between gap-4 mb-2">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 leading-none truncate">
                {trip.title}
              </h3>
            </div>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-6">
              {trip.vibe}
            </p>
            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100">
                  <img
                    src={
                      avatarUrl || `https://ui-avatars.com/api/?name=${username}&background=random`
                    }
                    alt={username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  by {username}
                </span>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
                  from
                </p>
                <p className="text-xl font-black text-primary leading-none">
                  {formatCurrency(trip.price)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
