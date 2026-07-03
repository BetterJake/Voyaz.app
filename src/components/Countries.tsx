"use client";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight, FaMapMarkerAlt, FaCompass } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useCountries, Country } from "@/hooks/useCountries";
import { useTrips, Trip } from "@/hooks/useTrips";
import { useTripPersonalizer } from "@/hooks/useTripPersonalizer";
import TripDetailOverlay from "./TripDetailOverlay";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, FreeMode, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/autoplay";
const COUNTRY_THEMES: Record<string, { color: string; icon: string; badge: string; tint: string }> =
  {
    Poland: {
      color: "text-blue-600",
      icon: "text-blue-500",
      badge: "bg-blue-50",
      tint: "rgba(37,99,235,0.06)",
    },
    Japan: {
      color: "text-red-600",
      icon: "text-red-500",
      badge: "bg-red-50",
      tint: "rgba(220,38,38,0.06)",
    },
    Brazil: {
      color: "text-emerald-600",
      icon: "text-emerald-500",
      badge: "bg-emerald-50",
      tint: "rgba(5,150,105,0.06)",
    },
    Germany: {
      color: "text-amber-600",
      icon: "text-amber-500",
      badge: "bg-amber-50",
      tint: "rgba(217,119,6,0.06)",
    },
    Thailand: {
      color: "text-indigo-600",
      icon: "text-indigo-500",
      badge: "bg-indigo-50",
      tint: "rgba(79,70,229,0.06)",
    },
    Spain: {
      color: "text-orange-600",
      icon: "text-orange-500",
      badge: "bg-orange-50",
      tint: "rgba(234,88,12,0.06)",
    },
  };
const Countries = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const { countries, isLoading } = useCountries();
  const { trips } = useTrips({ mode: "discovery" });
  const { personalizeTrip, isWeatherLoading } = useTripPersonalizer();
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const visualizerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const activeCountry = countries[activeIndex];
  useEffect(() => {
    setSelectedCity(null);
  }, [activeIndex]);
  useEffect(() => {
    if (swiperInstance && swiperInstance.realIndex !== activeIndex) {
      swiperInstance.slideToLoop(activeIndex);
    }
  }, [activeIndex, swiperInstance]);
  const handleOpenFeatured = async () => {
    if (!activeCountry || isWeatherLoading) return;
    const personalizedTrip = await personalizeTrip(activeCountry, selectedCity, trips);
    if (personalizedTrip) {
      setSelectedTrip(personalizedTrip);
    }
  };
  const getImageUrl = () => {
    if (!activeCountry) return "/images/trip-warsaw.png";
    if (selectedCity && activeCountry.cityImages?.[selectedCity]) {
      return activeCountry.cityImages[selectedCity];
    }
    return activeCountry.image || "/images/trip-warsaw.png";
  };
  return (
    <>
      <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 text-center md:text-left"
          >
            <h2 className="text-6xl md:text-8xl font-[1000] uppercase tracking-tighter leading-[0.85] mb-6">
              World <br /> <span className="text-blue-600">Network</span>
            </h2>
            <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs max-w-sm mx-auto md:mx-0">
              Curated destinations across the globe, optimized by AI for your style
            </p>
          </motion.div>
          <div className="flex items-center gap-12 bg-gray-50 p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <div className="flex flex-col items-center">
              <span className="text-5xl font-black text-gray-900 leading-none">
                {countries.length}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">
                Countries
              </span>
            </div>
            <div className="h-16 w-[1px] bg-gray-200" />
            <div className="flex flex-col items-center">
              <span className="text-5xl font-black text-gray-900 leading-none">
                {countries.reduce((acc, c) => acc + (c.cities?.length || 0), 0)}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">
                Cities
              </span>
            </div>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-16">
          <div className="relative group flex flex-col w-full">
            <div className="relative w-full aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl bg-gray-100">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeCountry?.name || "Poland"}-${selectedCity || "main"}`}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={getImageUrl()}
                    alt={selectedCity || activeCountry?.name || "Poland"}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </motion.div>
              </AnimatePresence>
              <div className="absolute bottom-0 left-0 p-12 md:p-16 w-full z-10">
                <div className="grid grid-cols-[1fr_auto] items-end gap-6 md:gap-10">
                  <div className="min-w-0 text-left">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedCity || activeCountry?.name}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-[1000] text-white mb-4 tracking-tighter uppercase leading-[0.9] whitespace-nowrap">
                          {selectedCity || activeCountry?.name}
                        </h3>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1, duration: 0.8 }}
                          className="text-white/60 text-sm leading-relaxed max-w-sm font-medium"
                        >
                          {selectedCity
                            ? `Exploring ${selectedCity}. Our AI engine is analyzing local pulse and hidden gems to craft your perfect day.`
                            : activeCountry?.description}
                        </motion.p>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <div className="shrink-0 pb-2">
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleOpenFeatured}
                      disabled={isWeatherLoading}
                      className={`w-20 h-20 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all shadow-2xl ${
                        isWeatherLoading
                          ? "bg-blue-600/50"
                          : "bg-blue-500 hover:bg-blue-600 shadow-blue-500/40"
                      }`}
                    >
                      {isWeatherLoading ? (
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <FaCompass className="text-white text-3xl md:text-4xl rotate-[12deg]" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              {activeCountry?.cities.slice(0, 8).map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedCity === city
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20 scale-105"
                      : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col h-full relative">
            <div
              className={`absolute left-0 right-0 flex items-center justify-between z-20 pointer-events-none ${isMobile ? "-top-8" : "-top-12"}`}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">
                Global Destinations
              </p>
              <div className="flex gap-1.5 opacity-30">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              </div>
            </div>
            <div
              className={`mt-8 ${isMobile && mounted ? "h-auto py-10" : "h-[660px]"} overflow-hidden px-16 -mx-16`}
            >
              {isLoading || !mounted ? (
                <div className="space-y-6 px-16">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-gray-50 rounded-[3rem] animate-pulse" />
                  ))}
                </div>
              ) : (
                <Swiper
                  key={mounted && isMobile ? "horiz" : "vert"}
                  direction={mounted && isMobile ? "horizontal" : "vertical"}
                  slidesPerView={mounted && isMobile ? 1.4 : 4}
                  spaceBetween={isMobile ? 16 : 12}
                  slideToClickedSlide={true}
                  threshold={5}
                  mousewheel={
                    isMobile
                      ? false
                      : {
                          releaseOnEdges: false,
                          forceToAxis: true,
                        }
                  }
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                  }}
                  loop={countries.length > 4}
                  onSwiper={setSwiperInstance}
                  onSlideChange={(swiper) => {
                    if (swiper.realIndex !== activeIndex) {
                      setActiveIndex(swiper.realIndex);
                    }
                  }}
                  preventClicks={false}
                  preventClicksPropagation={false}
                  modules={[Mousewheel, Autoplay]}
                  className={`h-full !overflow-visible ${isMobile ? "py-10 -my-10" : "px-100 -mx-100"}`}
                  data-lenis-prevent={!isMobile}
                >
                  {countries.map((country, idx) => {
                    const theme = COUNTRY_THEMES[country.name] || {
                      color: "text-blue-600",
                      icon: "text-blue-500",
                      badge: "bg-blue-50",
                      tint: "rgba(59,130,246,0.06)",
                    };
                    return (
                      <SwiperSlide key={`${country.name}-${idx}`} className="!h-auto py-2">
                        <motion.div
                          className={`group relative p-10 rounded-[3rem] cursor-pointer transition-all duration-500 border ${
                            activeIndex === idx
                              ? `bg-white border-blue-500/10 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12),0_15px_30px_-15px_rgba(0,0,0,0.08)] scale-[1.05] z-10`
                              : "bg-white/40 border-gray-100/50 grayscale opacity-40 hover:opacity-100 hover:grayscale-0 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50"
                          }`}
                          style={
                            activeIndex === idx
                              ? {
                                  backgroundColor: "white",
                                  boxShadow: `0 35px 70px -15px rgba(0,0,0,0.1), 0 20px 40px -20px ${theme.tint}`,
                                }
                              : {}
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-8">
                              <div
                                className={`w-20 h-20 rounded-[1.5rem] overflow-hidden relative shadow-lg transition-transform duration-500 group-hover:scale-110 ${activeIndex === idx ? "ring-4 ring-blue-50" : ""}`}
                              >
                                <Image
                                  src={country.image}
                                  alt={country.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <h4
                                  className={`text-xl md:text-2xl font-[1000] uppercase tracking-tighter whitespace-nowrap ${activeIndex === idx ? "text-gray-900" : "text-gray-400"}`}
                                >
                                  {country.name}
                                </h4>
                                <div className="flex items-center gap-3 mt-2">
                                  <FaMapMarkerAlt
                                    className={activeIndex === idx ? theme.icon : "text-gray-300"}
                                    size={12}
                                  />
                                  <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                                    Explore {country.name}
                                  </span>
                                  {activeIndex === idx && (
                                    <span
                                      className={`ml-3 px-3 py-1 rounded-full text-[9px] font-black tracking-tighter ${theme.badge} ${theme.color} opacity-0 group-hover:opacity-100 transition-opacity`}
                                    >
                                      {Number(country.trips).toLocaleString()}+ Voyages
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {activeIndex === idx && (
                              <motion.div
                                initial={{ scale: 0, x: 20 }}
                                animate={{ scale: 1, x: 0 }}
                                className={`w-12 h-12 ${theme.badge} rounded-full flex items-center justify-center ${theme.color} shadow-inner`}
                              >
                                <FaArrowRight size={14} />
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              )}
            </div>
          </div>
        </div>
      </section>
      <AnimatePresence>
        {selectedTrip && (
          <TripDetailOverlay trip={selectedTrip} onClose={() => setSelectedTrip(null)} />
        )}
      </AnimatePresence>
    </>
  );
};
export default Countries;
