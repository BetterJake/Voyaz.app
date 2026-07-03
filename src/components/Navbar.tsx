"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaBars, FaTimes } from "react-icons/fa";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "./UserMenu";
import SearchModal from "./SearchModal";
import NotificationIndicator from "./NotificationIndicator";
import { useAuth } from "@/context/AuthContext";
const navLinks = [
  { label: "Home", href: "/" },
  { label: "Trips", href: "/trips" },
  { label: "Plan Trip", href: "/plan-trip" },
];
const Navbar = () => {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const protectedPaths = ["/trips", "/plan-trip"];
  const visibleLinks = navLinks.filter((link) => {
    if (protectedPaths.includes(link.href)) {
      return !!user;
    }
    return true;
  });
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);
  useEffect(() => {
    setMounted(true);
  }, []);
  const excludedPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/onboarding",
  ];
  if (excludedPaths.some((path) => pathname.startsWith(path))) {
    return null;
  }
  const isDarkPage = pathname === "/" || pathname === "/terms" || pathname === "/privacy";
  return (
    <>
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
      <motion.nav
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { y: -20, opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.6,
              ease: "easeOut",
            },
          },
        }}
        className={`fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-6 md:px-12 py-4 md:py-6 font-sans transition-all duration-500 ${
          isScrolled
            ? isDarkPage
              ? "bg-black/80 backdrop-blur-2xl border-b border-white/5 py-4 shadow-2xl"
              : "bg-white/95 backdrop-blur-3xl border-b border-gray-100 py-4 shadow-2xl shadow-gray-200/50"
            : isDarkPage
              ? "bg-transparent border-b border-transparent"
              : "bg-white/80 backdrop-blur-2xl border-b border-gray-50"
        }`}
      >
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="font-extrabold text-2xl tracking-tighter flex items-center hover:opacity-80 transition-opacity gap-0.5"
          >
            <span className={isDarkPage ? "text-white" : "text-gray-900"}>VOYAZ</span>
            <span className={`${isDarkPage ? "text-white/30" : "text-gray-900/40"} text-xl`}>
              .APP
            </span>
          </Link>
          <div
            className={`hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] ${
              isDarkPage ? "text-white/50" : "text-gray-400"
            }`}
          >
            {mounted &&
              !loading &&
              visibleLinks.map(({ label, href }) => {
                const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`transition-all relative pb-2 ${
                      isActive
                        ? isDarkPage
                          ? "text-white"
                          : "text-gray-900"
                        : isDarkPage
                          ? "hover:text-white"
                          : "hover:text-gray-700"
                    }`}
                  >
                    {label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className={`absolute bottom-0 left-0 w-full h-[3px] rounded-full ${
                          isDarkPage
                            ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            : "bg-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                        }`}
                        initial={false}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <motion.div
            onClick={() => setIsSearchModalOpen(true)}
            className="relative hidden lg:block group cursor-pointer"
          >
            <FaSearch
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors text-xs ${
                isDarkPage
                  ? "text-white/40 group-hover:text-white"
                  : "text-gray-300 group-hover:text-gray-500"
              }`}
            />
            <div
              className={`pl-10 pr-12 py-2.5 rounded-2xl border text-[12px] font-bold w-64 transition-all duration-300 flex items-center justify-between ${
                isDarkPage
                  ? "bg-white/5 border-white/5 text-white/40 group-hover:bg-white/10 group-hover:border-white/10"
                  : "bg-gray-50 border-gray-100 text-gray-400 group-hover:bg-white group-hover:border-blue-100"
              }`}
            >
              <span className="whitespace-nowrap">Search destination...</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded border ${isDarkPage ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-100"}`}
              >
                ⌘K
              </span>
            </div>
          </motion.div>
          {user && <NotificationIndicator isDarkPage={isDarkPage} />}
          <UserMenu isDarkPage={isDarkPage} />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden w-10 h-10 flex items-center justify-center rounded-2xl border transition-colors ${
              isDarkPage
                ? "bg-white/5 border-white/10 text-white"
                : "bg-gray-50 border-gray-200 text-gray-900 shadow-sm"
            }`}
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </motion.button>
        </div>
      </motion.nav>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed inset-0 z-[90] backdrop-blur-3xl md:hidden pt-32 px-10 ${
              isDarkPage ? "bg-black/95" : "bg-white/95"
            }`}
          >
            <div className="flex flex-col gap-10">
              {mounted &&
                !loading &&
                visibleLinks.map(({ label, href }, idx) => {
                  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
                  return (
                    <motion.div
                      key={href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + idx * 0.1 }}
                    >
                      <Link
                        href={href}
                        className={`text-4xl font-black uppercase tracking-tighter ${
                          isActive
                            ? isDarkPage
                              ? "text-white"
                              : "text-blue-600"
                            : isDarkPage
                              ? "text-white/30"
                              : "text-gray-300"
                        }`}
                      >
                        {label}
                      </Link>
                    </motion.div>
                  );
                })}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`mt-10 pt-10 border-t ${isDarkPage ? "border-white/5" : "border-gray-100"}`}
              >
                <div
                  onClick={() => {
                    setIsSearchModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="relative group cursor-pointer"
                >
                  <FaSearch
                    className={`absolute left-4 top-1/2 -translate-y-1/2 text-xl ${isDarkPage ? "text-white/20" : "text-gray-300"}`}
                  />
                  <div
                    className={`w-full pl-14 pr-4 py-5 rounded-3xl border text-lg font-bold flex items-center ${
                      isDarkPage
                        ? "bg-white/5 border-white/5 text-white/30"
                        : "bg-gray-50 border-gray-100 text-gray-400"
                    }`}
                  >
                    Search destination...
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default Navbar;
