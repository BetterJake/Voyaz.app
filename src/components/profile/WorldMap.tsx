"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import { Trip } from "@/hooks/useTrips";
interface WorldMapProps {
  trips: Trip[];
}
export function WorldMap({ trips }: WorldMapProps) {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const markers = useMemo(() => {
    return trips
      .map((t) => {
        const firstDay = Array.isArray(t.itinerary) ? t.itinerary[0] : null;
        const firstPlace = firstDay && Array.isArray(firstDay.places) ? firstDay.places[0] : null;
        if (firstPlace && firstPlace.lat && firstPlace.lng) {
          return {
            trip: t,
            position: { lat: Number(firstPlace.lat), lng: Number(firstPlace.lng) },
          };
        }
        return null;
      })
      .filter((m): m is { trip: Trip; position: { lat: number; lng: number } } => m !== null);
  }, [trips]);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full aspect-[2/1] bg-white/40 backdrop-blur-3xl border border-white/50 rounded-[40px] shadow-2xl overflow-hidden group"
    >
      <Map
        defaultCenter={{ lat: 20, lng: 0 }}
        defaultZoom={2}
        gestureHandling={"cooperative"}
        disableDefaultUI={true}
        mapId="voyaz_profile_map"
        className="w-full h-full"
      >
        {markers.map((marker) => (
          <React.Fragment key={marker.trip.id}>
            <AdvancedMarker position={marker.position} onClick={() => setSelectedTrip(marker.trip)}>
              <div className="relative cursor-pointer">
                <div className="absolute -inset-4 bg-primary/30 rounded-full animate-ping opacity-75" />
                <div className="relative w-4 h-4 bg-primary border-2 border-white rounded-full shadow-lg shadow-primary/50 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              </div>
            </AdvancedMarker>
            {selectedTrip?.id === marker.trip.id && (
              <InfoWindow position={marker.position} onCloseClick={() => setSelectedTrip(null)}>
                <div className="p-3 max-w-[200px] bg-white rounded-xl">
                  <div className="w-full h-24 rounded-lg overflow-hidden mb-3">
                    <img
                      src={marker.trip.image || "/images/generated-trips.png"}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <h4 className="font-black uppercase tracking-tight text-gray-900 text-sm mb-1">
                    {marker.trip.title}
                  </h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    {marker.trip.vibe}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <span className="text-primary font-black text-xs">${marker.trip.price}</span>
                    <span className="text-gray-400 font-bold text-[10px]">
                      {marker.trip.days} DAYS
                    </span>
                  </div>
                </div>
              </InfoWindow>
            )}
          </React.Fragment>
        ))}
      </Map>
      <div className="absolute top-8 left-8 pointer-events-none">
        <h3 className="text-xl font-black uppercase tracking-tighter text-white drop-shadow-md">
          Global Track
        </h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary mt-1">
          Traveler Footprint
        </p>
      </div>
      <div className="absolute bottom-8 left-8 p-4 bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/10 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white">
            {trips.length} EXPLORED CITIES
          </span>
        </div>
      </div>
      <div className="absolute top-8 right-8 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-right pointer-events-none">
        <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Map Engine</p>
        <p className="text-[10px] font-black text-white uppercase tracking-tighter">
          Google Enterprise
        </p>
      </div>
    </motion.div>
  );
}
