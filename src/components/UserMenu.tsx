"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaSignOutAlt, FaCog, FaCompass, FaChevronDown } from "react-icons/fa";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface UserMenuProps {
  isDarkPage?: boolean;
}

const UserMenu = ({ isDarkPage }: UserMenuProps) => {
  const { user, signOut, loading, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarSrc =
    profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${user?.email}&background=random`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading)
    return (
      <div
        className={`w-10 h-10 rounded-2xl animate-pulse ${isDarkPage ? "bg-white/10" : "bg-gray-100"}`}
      />
    );

  if (!user) {
    return (
      <div className="flex items-center gap-6">
        <Link
          href="/login"
          className={`text-[12px] font-black uppercase tracking-[0.2em] transition-colors ${
            isDarkPage ? "text-white/60 hover:text-white" : "text-gray-400 hover:text-gray-900"
          }`}
        >
          Login
        </Link>
        <Link
          href="/register"
          className={`px-6 py-2.5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all shadow-xl hover:scale-105 active:scale-95 ${
            isDarkPage
              ? "bg-white text-black shadow-white/10"
              : "bg-blue-600 text-white shadow-blue-600/20"
          }`}
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 p-1 rounded-2xl border transition-all ${
          isOpen
            ? isDarkPage
              ? "bg-white/10 border-white/20"
              : "bg-white border-blue-100 shadow-xl"
            : isDarkPage
              ? "bg-white/5 border-white/5 hover:border-white/10"
              : "bg-gray-50 border-gray-100 hover:border-gray-200 shadow-sm"
        }`}
      >
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-[14px] overflow-hidden border border-white/10">
          <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <FaChevronDown
          className={`text-[10px] mr-2 transition-transform duration-300 ${isOpen ? "rotate-180" : ""} ${
            isDarkPage ? "text-white/30" : "text-gray-400"
          }`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={`absolute right-0 mt-3 w-64 rounded-3xl p-3 border backdrop-blur-3xl shadow-2xl z-[110] ${
              isDarkPage
                ? "bg-black/80 border-white/10 text-white"
                : "bg-white/90 border-gray-100 text-gray-900"
            }`}
          >
            <div className="px-4 py-3 mb-2">
              <p className={`text-[10px] font-black uppercase tracking-widest opacity-40 mb-1`}>
                Account
              </p>
              <p className="text-sm font-bold truncate">{user.email}</p>
            </div>

            <div className={`h-[1px] w-full mb-2 ${isDarkPage ? "bg-white/5" : "bg-gray-100"}`} />

            <div className="space-y-1">
              <MenuLink
                href="/profile"
                icon={<FaUser />}
                label="Profile"
                isDarkPage={isDarkPage || false}
                onClick={() => setIsOpen(false)}
              />
              <MenuLink
                href="/trips?tab=mine"
                icon={<FaCompass />}
                label="My Voyages"
                isDarkPage={isDarkPage || false}
                onClick={() => setIsOpen(false)}
              />
              <MenuLink
                href="/settings"
                icon={<FaCog />}
                label="Settings"
                isDarkPage={isDarkPage || false}
                onClick={() => setIsOpen(false)}
              />
            </div>

            <div className={`h-[1px] w-full my-2 ${isDarkPage ? "bg-white/5" : "bg-gray-100"}`} />

            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${
                isDarkPage ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"
              }`}
            >
              <FaSignOutAlt className="text-xs" />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MenuLink = ({
  href,
  icon,
  label,
  isDarkPage,
  onClick,
}: {
  href: string;
  icon: any;
  label: string;
  isDarkPage: boolean;
  onClick?: () => void;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
      isDarkPage
        ? "hover:bg-white/5 text-white/80 hover:text-white"
        : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
    }`}
  >
    <span className="text-xs opacity-60">{icon}</span>
    {label}
  </Link>
);

export default UserMenu;
