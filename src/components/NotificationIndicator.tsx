import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoNotificationsOutline, IoChevronForward } from "react-icons/io5";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/features/social/hooks/useNotifications";
import { NotificationDropdownItem } from "@/features/social/components/NotificationDropdownItem";

interface NotificationIndicatorProps {
  isDarkPage?: boolean;
}

export default function NotificationIndicator({ isDarkPage }: NotificationIndicatorProps) {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications(user?.id);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const latestNotifications = notifications.slice(0, 6);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative group p-2.5 rounded-2xl transition-all ${
          isOpen ? (isDarkPage ? "bg-white/10" : "bg-gray-100") : "bg-transparent"
        }`}
      >
        <div
          className={`absolute inset-0 rounded-2xl transition-colors ${
            isDarkPage ? "group-hover:bg-white/10" : "group-hover:bg-gray-100"
          }`}
        />
        <div className="relative">
          <IoNotificationsOutline
            className={`text-xl transition-colors ${
              isDarkPage
                ? isOpen
                  ? "text-white"
                  : "text-white/60 group-hover:text-white"
                : isOpen
                  ? "text-gray-900"
                  : "text-gray-400 group-hover:text-gray-900"
            }`}
          />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-lg shadow-primary/30"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={`absolute right-0 mt-3 w-80 md:w-96 rounded-3xl p-3 border backdrop-blur-3xl shadow-2xl z-[110] ${
              isDarkPage
                ? "bg-black/90 border-white/10 text-white"
                : "bg-white/90 border-gray-100 text-gray-900 shadow-gray-200/50"
            }`}
          >
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between mb-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <div className="text-[9px] font-black px-2 py-0.5 bg-primary text-white rounded-full uppercase">
                  {unreadCount} New
                </div>
              )}
            </div>

            <div className="max-h-[70vh] overflow-y-auto no-scrollbar space-y-1">
              {latestNotifications.length > 0 ? (
                latestNotifications.map((notif) => (
                  <NotificationDropdownItem
                    key={notif.id}
                    notification={notif}
                    onMarkAsRead={markAsRead}
                    onClick={() => setIsOpen(false)}
                    isDarkPage={isDarkPage}
                  />
                ))
              ) : (
                <div className="py-12 text-center">
                  <IoNotificationsOutline className="text-3xl mx-auto mb-3 opacity-10" />
                  <p className="text-xs font-bold opacity-30 uppercase tracking-widest">
                    No notifications yet
                  </p>
                </div>
              )}
            </div>

            <div className={`h-[1px] w-full my-2 ${isDarkPage ? "bg-white/5" : "bg-gray-100"}`} />

            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                isDarkPage
                  ? "hover:bg-white/5 text-white/40 hover:text-white"
                  : "hover:bg-gray-50 text-gray-400 hover:text-gray-900"
              }`}
            >
              See All Activity
              <IoChevronForward className="text-xs" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
