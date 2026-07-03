"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoNotificationsOutline, IoCheckmarkCircle } from "react-icons/io5";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/features/social/hooks/useNotifications";
import { useSocialActions } from "@/features/social/hooks/useSocialActions";
import { NotificationItem } from "@/features/social/components/NotificationItem";
import { CONTAINER_VARIANTS, TOAST_DURATION } from "@/features/social/constants";
import { SocialNotification } from "@/features/social/types";

export default function NotificationsPage() {
  const { user: currentUser } = useAuth();
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  } = useNotifications(currentUser?.id);

  const showSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), TOAST_DURATION);
  };

  // Internal component to handle individual notification actions to keep the main loop clean
  const NotificationRow = ({ notification }: { notification: SocialNotification }) => {
    const socialActions = useSocialActions({
      currentUserId: currentUser?.id,
      targetUserId: notification.actor_id,
      onSuccess: showSuccess,
      onError: (msg) => console.error(msg),
    });

    const handleAction = async (action: "accept" | "decline") => {
      try {
        if (notification.type === "friend_request") {
          if (action === "accept") {
            await socialActions.handleFriendAction("incoming_pending");
          } else if (action === "decline") {
            await socialActions.handleDecline();
          }
        } else if (notification.type === "trip_shared") {
          const tripId = notification.metadata?.trip_id;
          if (tripId) {
            if (action === "accept") {
              await socialActions.handleAcceptTripShare(tripId);
            } else if (action === "decline") {
              await socialActions.handleDeclineTripShare(tripId);
            }
          }
        }
        await deleteNotification(notification.id);
        refresh();
      } catch (err) {
        console.error("Notification action failed:", err);
      }
    };

    return (
      <NotificationItem
        notification={notification}
        onMarkAsRead={markAsRead}
        onDelete={deleteNotification}
        onAccept={() => handleAction("accept")}
        onDecline={() => handleAction("decline")}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 md:pt-32 pb-20">
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 border border-white/10 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <IoCheckmarkCircle className="text-green-400 text-xl" />
            <span className="text-white text-sm font-bold uppercase tracking-widest">
              {successToast}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                <IoNotificationsOutline className="text-primary text-2xl" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 leading-none">
                Inbox
              </h1>
            </div>
            <p className="text-gray-500 font-bold text-base md:text-lg">
              Manage your activity and requests.
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full font-black">
                  {unreadCount} UNREAD
                </span>
              )}
            </p>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1 self-start md:self-auto"
            >
              Mark all as read
            </button>
          )}
        </header>

        <main>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-white rounded-[32px] animate-pulse border border-gray-100"
                />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[40px] p-12 md:p-20 text-center border border-gray-100 shadow-sm"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <IoNotificationsOutline className="text-2xl md:text-3xl text-gray-200" />
              </div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-900 mb-2">
                Clear Sky
              </h2>
              <p className="text-gray-400 font-medium">You&apos;re all caught up!</p>
            </motion.div>
          ) : (
            <motion.div
              variants={CONTAINER_VARIANTS}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {notifications.map((notif) => (
                <NotificationRow key={notif.id} notification={notif} />
              ))}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
