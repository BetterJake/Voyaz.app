"use client";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaChevronLeft, FaChevronRight, FaStar } from "react-icons/fa";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useTrips, Trip } from "@/hooks/useTrips";
import { useFavourites } from "@/context/FavouritesContext";
import { usePreferences } from "@/context/PreferencesContext";
import TripDetailOverlay from "./TripDetailOverlay";

interface TripCardProps {
  trip: Trip;
  index: number;
  onSelect: (trip: Trip) => void;
}

const TripCard = ({ trip, index, onSelect }: TripCardProps) => {
  const { isFavourite, toggleFavourite } = useFavourites();
  const { formatCurrency } = usePreferences();
  const active = isFavourite(trip.id);
  return (
    <motion.div
      layoutId={`trip-card-${trip.id}`}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      onClick={() => onSelect(trip)}
      whileHover={{ y: -10 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
      }}
      className="relative h-[450px] w-[300px] md:w-[350px] rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-xl shrink-0 snap-center"
    >
      <motion.div
        layoutId={`trip-image-container-${trip.id}`}
        className="absolute inset-0 z-0"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.6 }}
      >
        <Image
          src={trip.image || "/images/generated-trips.png"}
          alt={trip.title}
          fill
          sizes="(max-width: 768px) 100vw, 350px"
          className="object-cover"
        />
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.2, rotate: 15 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          toggleFavourite(trip.id);
        }}
        className={`absolute top-6 right-6 z-10 p-4 rounded-2xl backdrop-blur-xl border border-white/10 transition-all ${
          active
            ? "bg-pink-500 text-white border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.4)]"
            : "bg-white/10 text-white/90 hover:text-pink-400"
        } drop-shadow-md`}
      >
        <FaHeart className="text-xl" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-[1]" />
      <div className="absolute bottom-0 left-0 w-full p-8 flex justify-between items-end z-[2]">
        <motion.div
          layoutId={`trip-info-${trip.id}`}
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.3 }}
        >
          <h4 className="text-2xl font-black text-white mb-2 leading-tight">{trip.title}</h4>
          <p className="text-blue-300 text-sm font-bold uppercase tracking-wider">
            {trip.days} Days • {trip.places} Places
          </p>
        </motion.div>
        <motion.div
          layoutId={`trip-price-${trip.id}`}
          className="text-white/80 text-xs font-bold text-right uppercase tracking-tighter shrink-0 ml-4"
        >
          from <br />
          <span className="text-white font-black text-2xl leading-none whitespace-nowrap">
            {formatCurrency(trip.price)}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
};
const HottestTrips = () => {
  const { trips, isLoading } = useTrips({ mode: "discovery" });
  const [width, setWidth] = useState(0);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (innerRef.current && carouselRef.current) {
      setWidth(innerRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [trips, isLoading]);
  const [dragProgress, setDragProgress] = useState(0);
  const cardStep =
    innerRef.current && trips.length > 0 ? innerRef.current.scrollWidth / trips.length : 0;
  const itemsInView =
    carouselRef.current && cardStep > 0 ? carouselRef.current.offsetWidth / cardStep : 1;
  const dotsCount = Math.max(1, trips.length - Math.floor(itemsInView) + 1);
  const activeIndex =
    cardStep > 0 ? Math.min(dotsCount - 1, Math.round(Math.abs(dragProgress / cardStep))) : 0;
  const scrollToIndex = (index: number) => {
    if (cardStep > 0) {
      const targetIndex = Math.min(index, dotsCount - 1);
      setDragProgress(-targetIndex * cardStep);
    }
  };
  const scroll = (direction: "left" | "right") => {
    const scrollAmount = cardStep > 0 ? cardStep : 400;
    const newX =
      direction === "left"
        ? Math.min(0, dragProgress + scrollAmount)
        : Math.max(-width, dragProgress - scrollAmount);
    setDragProgress(newX);
  };
  return (
    <section className="py-24 relative overflow-hidden bg-white">
      <div className="px-6 md:px-12 max-w-[1400px] mx-auto flex justify-between items-end mb-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-black uppercase tracking-tight text-black"
        >
          Hottest Trips
        </motion.h2>
        <div className="flex gap-4">
          <button
            onClick={() => scroll("left")}
            className="w-12 h-12 rounded-full border-2 border-gray-200 text-gray-500 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all"
          >
            <FaChevronLeft className="-ml-1" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-12 h-12 rounded-full border-2 border-gray-200 text-gray-500 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all"
          >
            <FaChevronRight className="-mr-1" />
          </button>
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-[450px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      ) : (
        <motion.div
          ref={carouselRef}
          className="w-full relative px-6 md:px-12 cursor-grab active:cursor-grabbing overflow-hidden pt-10 pb-10"
        >
          <motion.div
            ref={innerRef}
            drag="x"
            dragConstraints={{ right: 0, left: -width }}
            animate={{ x: dragProgress }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex gap-6"
          >
            {trips.map((trip, idx) => (
              <TripCard key={trip.id} trip={trip} index={idx} onSelect={setSelectedTrip} />
            ))}
            <div className="shrink-0 w-6 md:w-12" />
          </motion.div>
        </motion.div>
      )}
      <AnimatePresence>
        {selectedTrip && (
          <TripDetailOverlay trip={selectedTrip} onClose={() => setSelectedTrip(null)} />
        )}
      </AnimatePresence>
      {trips.length > 0 && (
        <div className="flex justify-center gap-3 -mt-2">
          {Array.from({ length: dotsCount }).map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => scrollToIndex(idx)}
              initial={false}
              animate={{
                width: activeIndex === idx ? 24 : 8,
                backgroundColor: activeIndex === idx ? "#419BF9" : "#E2E8F0",
              }}
              whileHover={{
                backgroundColor: activeIndex === idx ? "#419BF9" : "#CBD5E0",
              }}
              className="h-2 rounded-full transition-colors cursor-pointer"
            />
          ))}
        </div>
      )}
    </section>
  );
};
export default HottestTrips;
