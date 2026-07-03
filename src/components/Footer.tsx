"use client";
import { motion } from "framer-motion";
import { FaTiktok, FaInstagram, FaFacebookF, FaArrowRight, FaMapMarkerAlt } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
const Footer = () => {
  return (
    <footer className="w-full pt-32 overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1433838552652-f9a46b332c40?q=80&w=2070&auto=format&fit=crop"
          alt="Clouds Background"
          fill
          className="object-cover brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent" />
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-32">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-baseline gap-1 mb-8 group">
              <span className="text-4xl font-[1000] text-white tracking-tighter uppercase leading-none">
                VOYAZ
              </span>
              <span className="text-blue-500 font-black text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform block">
                .app
              </span>
            </Link>
            <p className="text-white/40 text-lg leading-relaxed mb-12 max-w-md font-medium">
              The world&apos;s first AI-native discovery platform. Plan, track, and experience
              journeys that match your unique frequency.
            </p>
            <div className="flex gap-4">
              {[
                { Icon: FaInstagram, label: "Instagram" },
                { Icon: FaTiktok, label: "TikTok" },
                { Icon: FaFacebookF, label: "Facebook" },
              ].map((item, idx) => (
                <motion.a
                  key={idx}
                  href="#"
                  whileHover={{ scale: 1.1, backgroundColor: "#1d4ed8", color: "#fff" }}
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40 transition-all shadow-xl"
                  title={item.label}
                >
                  <item.Icon className="text-xl" />
                </motion.a>
              ))}
            </div>
          </div>
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div>
              <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-white/20 mb-8">
                Navigation
              </h4>
              <ul className="flex flex-col gap-5">
                {[
                  { label: "Home", href: "/" },
                  { label: "Trips", href: "/trips" },
                  { label: "Plan Trip", href: "/plan-trip" },
                  { label: "Community", href: "/trips" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-bold text-white/60 hover:text-blue-400 transition-all uppercase tracking-widest block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-white/20 mb-8">
                Support
              </h4>
              <ul className="flex flex-col gap-5">
                {[
                  { label: "Help Center", href: "#" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Cookies", href: "#" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-bold text-white/60 hover:text-blue-400 transition-all uppercase tracking-widest block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="pt-12 pb-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
              System Status: Fully Operational
            </span>
          </div>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
            © 2025 VOYAZ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
