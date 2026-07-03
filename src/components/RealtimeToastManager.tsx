"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoNotificationsOutline,
  IoPersonAddOutline,
  IoRadioOutline,
  IoCloseOutline,
  IoChatbubbleOutline,
} from "react-icons/io5";
import { useAuth } from "@/context/AuthContext";
import { useAbly } from "@/hooks/useAbly";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";

interface Toast {
  id: string;
  type: "friend_request" | "new_follower" | "friend_accept" | "new_message";
  actorName: string;
  actorAvatar?: string;
  tripTitle?: string;
  messageSnippet?: string;
  tripId?: string;
}

export default function RealtimeToastManager() {
  const { user } = useAuth();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const addToast = useCallback(
    async (data: any) => {
      if (pathname === "/notifications") return;
      try {
        const { data: actor } = await supabase
          .from("profiles")
          .select("username, avatar_url, first_name, last_name")
          .eq("id", data.actor_id)
          .single();

        const displayName =
          [actor?.first_name, actor?.last_name].filter(Boolean).join(" ") ||
          actor?.username ||
          "Someone";

        const newToast: Toast = {
          id: Math.random().toString(36).substr(2, 9),
          type: data.type,
          actorName: displayName,
          actorAvatar: actor?.avatar_url,
          tripTitle: data.trip_title,
          messageSnippet: data.message_snippet,
          tripId: data.trip_id,
        };

        setToasts((prev) => [newToast, ...prev]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
        }, 5000);
      } catch (err) {
        console.error("Error adding real-time toast:", err);
      }
    },
    [supabase, pathname]
  );

  useAbly(user?.id, (message) => {
    if (message.name === "notification") {
      addToast(message.data);
    }
  });

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-24 right-6 z-[200] flex flex-col gap-4 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto group relative bg-white/80 backdrop-blur-2xl border border-white/50 rounded-3xl p-5 shadow-2xl shadow-gray-200/50 flex items-center gap-4 cursor-pointer overflow-hidden"
            onClick={() => {
              router.push("/notifications");
              removeToast(toast.id);
            }}
          >
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 5, ease: "linear" }}
              className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20 origin-left"
            />
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
                <img
                  src={
                    toast.actorAvatar ||
                    `https://ui-avatars.com/api/?name=${toast.actorName}&background=random`
                  }
                  alt={toast.actorName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-lg flex items-center justify-center shadow-lg border-2 border-white">
                {toast.type === "friend_request" ? (
                  <IoPersonAddOutline size={10} className="text-white" />
                ) : toast.type === "new_message" ? (
                  <IoChatbubbleOutline size={10} className="text-white" />
                ) : (
                  <IoRadioOutline size={10} className="text-white" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">
                New Activity
              </p>
              <p className="text-sm font-bold text-gray-900 leading-tight">
                <span className="font-black uppercase tracking-tight">@{toast.actorName}</span>
                <span className="ml-1 opacity-60 font-medium lowercase">
                  {toast.type === "friend_request" && "sent you a friend request"}
                  {toast.type === "new_follower" && "started following you"}
                  {toast.type === "friend_accept" && "accepted your friend request"}
                  {toast.type === "new_message" &&
                    `sent a message in ${toast.tripTitle || "the trip"}`}
                </span>
              </p>
              {toast.type === "new_message" && toast.messageSnippet && (
                <p className="text-[11px] text-gray-500 mt-1 line-clamp-1 italic font-medium">
                  &quot;{toast.messageSnippet}&quot;
                </p>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-300 hover:text-gray-900 transition-colors"
            >
              <IoCloseOutline size={20} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
