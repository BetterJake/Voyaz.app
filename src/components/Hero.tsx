"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillWave } from "react-icons/fa";
import Image from "next/image";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePreferences } from "@/context/PreferencesContext";
import { getCurrencySymbol } from "@/utils/formatters";
import { useAuth } from "@/context/AuthContext";

const Hero = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const { formatCurrency } = usePreferences();
  const preferredCurrency = profile?.preferred_currency || "USD ($)";
  const currencySymbol = getCurrencySymbol(preferredCurrency);
  const containerRef = useRef(null);
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState("");
  const [showError, setShowError] = useState(false);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "80%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const handleExplore = () => {
    if (!destination.trim()) {
      setShowError(true);
      setTimeout(() => setShowError(false), 500);
      return;
    }
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (days) params.set("days", days);
    if (budget) params.set("budget", budget);
    router.push(`/plan-trip?${params.toString()}`);
  };
  const inputs = [
    {
      id: "dest",
      icon: FaMapMarkerAlt,
      placeholder: "Where do you want to go?",
      value: destination,
      setter: setDestination,
      error: showError && !destination,
    },
    {
      id: "days",
      icon: FaCalendarAlt,
      placeholder: "How many days?",
      value: days,
      setter: setDays,
      inputMode: "numeric" as const,
    },
    {
      id: "budget",
      icon: FaMoneyBillWave,
      placeholder: `Budget per person (${currencySymbol})`,
      value: budget,
      setter: setBudget,
      inputMode: "decimal" as const,
    },
  ];
  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black"
    >
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <motion.div style={{ scale: bgScale }} className="relative w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop"
            alt="Background"
            fill
            className="object-cover opacity-80"
            priority
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/20" />
      </div>
      <motion.div
        style={{ y: textY }}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white select-none -translate-y-[10vh]"
      >
        <div className="flex flex-col items-end w-fit">
          <h1 className="text-[12vw] md:text-[10vw] font-[1000] tracking-[-0.05em] leading-[0.8] uppercase opacity-95">
            Discover
          </h1>
          <h2 className="text-[8vw] md:text-[7vw] font-[1000] tracking-[-0.05em] leading-[0.8] uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 mt-[1vw]">
            The World
          </h2>
          <div className="h-[40px] md:h-[60px]" />
        </div>
      </motion.div>
      <div className="absolute inset-0 z-20 select-none pointer-events-none">
        <motion.div style={{ scale: bgScale }} className="relative w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop"
            alt="Mask"
            fill
            className="object-cover"
            style={{
              WebkitMaskImage: 'url("/images/maskahero.png")',
              maskImage: 'url("/images/maskahero.png")',
              WebkitMaskSize: "cover",
              maskSize: "cover",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              filter: "brightness(0.6)",
            }}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80" />
      </div>
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center select-none pointer-events-none -translate-y-[10vh]">
        <div className="flex flex-col items-end w-fit">
          <div className="text-[12vw] md:text-[10vw] leading-[0.8] opacity-0">Discover</div>
          <div className="text-[8vw] md:text-[7vw] leading-[0.8] mt-[1vw] opacity-0">The World</div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-46 text-[10px] md:text-[12px] font-black tracking-[0.4em] uppercase text-white/50 text-right w-full"
          >
            Experience your next adventure through AI-native guidance
          </motion.p>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-12 z-40 w-[95%] max-w-5xl bg-white/5 backdrop-blur-[40px] rounded-[2.5rem] p-3 flex flex-col md:flex-row gap-2 items-center border border-white/10"
      >
        {inputs.map((item) => (
          <div
            key={item.id}
            className={`flex-1 flex items-center gap-4 bg-white/5 rounded-2xl px-6 py-4 w-full border transition-all duration-300 group ${
              (item as any).error
                ? "border-red-500/50 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                : "border-white/5"
            }`}
          >
            <item.icon
              className={`transition-colors ${
                (item as any).error ? "text-red-500" : "text-white/30 group-hover:text-white"
              }`}
            />
            <input
              type="text"
              inputMode={item.inputMode || "text"}
              placeholder={item.placeholder}
              value={item.value}
              onChange={(e) => {
                const val = e.target.value;
                if (item.id === "days") {
                  const cleaned = val.replace(/[^0-9]/g, "");
                  if (cleaned !== "" && parseInt(cleaned) > 7) {
                    item.setter("7");
                  } else {
                    item.setter(cleaned);
                  }
                } else if (item.id === "budget") {
                  const cleaned = val.replace(/[^0-9.]/g, "");
                  const parts = cleaned.split(".");
                  let finalVal = parts.length > 2 ? `${parts[0]}.${parts[1]}` : cleaned;

                  // Cap budget at 200,000
                  if (finalVal !== "" && !isNaN(parseFloat(finalVal))) {
                    if (parseFloat(finalVal) > 200000) {
                      finalVal = "200000";
                    }
                  }
                  item.setter(finalVal);
                } else {
                  item.setter(val);
                }
              }}
              className="bg-transparent border-none text-white placeholder-white/20 font-bold outline-none w-full text-sm"
            />
          </div>
        ))}
        <button
          onClick={handleExplore}
          className="bg-white text-black h-full rounded-2xl px-10 py-5 font-[1000] uppercase tracking-[0.2em] flex items-center gap-3 w-full md:w-auto justify-center"
        >
          <FaSearch className="text-xs" /> Explore
        </button>
      </motion.div>
    </section>
  );
};
export default Hero;
