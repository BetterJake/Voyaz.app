"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/pagination";
const SLIDES = [
  {
    id: 1,
    title: "TRAVEL SMARTER NOT HARDER!",
    subtitle:
      "Handcrafted itineraries from travelers worldwide. Take them as-is or make them uniquely yours.",
    image:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2070",
  },
  {
    id: 2,
    title: "EXPLORE THE UNKNOWN",
    subtitle: "Discover hidden gems and off-the-beaten-path locations recommended by locals.",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=2073",
  },
  {
    id: 3,
    title: "YOUR JOURNEY, YOUR RULES",
    subtitle:
      "Plan your trip with precision using our advanced itinerary builder and local guides.",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=2070",
  },
];
export function AuthSwiper() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet !bg-white/40 !opacity-100",
          bulletActiveClass:
            "swiper-pagination-bullet-active !bg-primary !w-8 !rounded-full transition-all duration-300",
        }}
        loop
        className="h-full w-full"
      >
        {SLIDES.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full w-full">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                style={{
                  backgroundImage: `url("${slide.image}")`,
                  filter: "brightness(0.7)",
                }}
              />
              <div className="absolute top-10 left-10 z-10 flex items-center gap-2 text-white">
                <span className="text-2xl font-bold tracking-tight">voyaz.app</span>
              </div>
              <div className="absolute bottom-20 left-12 z-10 max-w-md text-white">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="mb-4 text-5xl font-extrabold leading-tight tracking-tight uppercase"
                >
                  {slide.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-lg font-light text-white/80"
                >
                  {slide.subtitle}
                </motion.p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <style jsx global>{`
        .swiper-pagination {
          bottom: 2rem !important;
          left: 3rem !important;
          text-align: left !important;
          width: auto !important;
        }
        .swiper-pagination-bullet {
          height: 8px !important;
          width: 8px !important;
          margin: 0 4px !important;
          background: rgba(255, 255, 255, 0.4) !important;
          opacity: 1 !important;
          transition: all 0.3s ease !important;
        }
        .swiper-pagination-bullet-active {
          background: var(--primary) !important;
          width: 32px !important;
          border-radius: 4px !important;
        }
      `}</style>
    </div>
  );
}
