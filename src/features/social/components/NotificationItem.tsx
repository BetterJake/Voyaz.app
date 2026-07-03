import React from "react";
import { motion } from "framer-motion";
import {
  IoPersonAddOutline,
  IoRadioOutline,
  IoTimeOutline,
  IoTrashOutline,
  IoAirplaneOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
} from "react-icons/io5";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { SocialNotification } from "../types";
import { ITEM_VARIANTS } from "../constants";

interface NotificationItemProps {
  notification: SocialNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAccept: () => void;
  onDecline: () => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onAccept,
  onDecline,
}: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "friend_request":
        return <IoPersonAddOutline size={14} className="text-white" />;
      case "trip_shared":
        return <IoAirplaneOutline size={14} className="text-white" />;
      default:
        return <IoRadioOutline size={14} className="text-white" />;
    }
  };

  const getMessage = () => {
    switch (notification.type) {
      case "friend_request":
        return "sent you a friend request";
      case "trip_shared":
        return "invited you to join a voyage";
      case "friend_accept":
        return "accepted your friend request";
      case "new_follower":
        return "started following you";
      default:
        return "sent you a notification";
    }
  };

  const isInteractive =
    notification.type === "friend_request" || notification.type === "trip_shared";

  return (
    <motion.div
      variants={ITEM_VARIANTS}
      onMouseEnter={() =>
        !notification.is_read &&
        notification.type !== "friend_request" &&
        notification.type !== "trip_shared" &&
        onMarkAsRead(notification.id)
      }
      className={`relative group bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-6 border transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/40 ${
        notification.is_read ? "border-gray-50" : "border-primary/20 bg-primary/[0.02]"
      }`}
    >
      <div className="flex items-center gap-4 md:gap-6">
        <Link href={`/profile/${notification.actor_id}`} className="relative shrink-0">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
            <img
              src={
                notification.actor.avatar_url ||
                `https://ui-avatars.com/api/?name=${notification.actor.username}&background=random`
              }
              alt={notification.actor.username}
              className="w-full h-full object-cover"
            />
          </div>
          <div
            className={`absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-lg flex items-center justify-center shadow-lg ${
              notification.type === "friend_request"
                ? "bg-blue-500"
                : notification.type === "trip_shared"
                  ? "bg-emerald-500"
                  : "bg-primary"
            }`}
          >
            {getIcon()}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-1">
            <p className="text-sm md:text-base font-bold text-gray-900 truncate">
              <span className="font-black uppercase tracking-tight">
                @{notification.actor.username}
              </span>{" "}
              <span className="text-gray-500 font-medium">{getMessage()}</span>
            </p>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 flex items-center gap-1 shrink-0">
              <IoTimeOutline />
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
          </div>

          {isInteractive && (
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAccept();
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
              >
                <IoCheckmarkOutline size={14} />
                {notification.type === "trip_shared" ? "Join Voyage" : "Accept"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDecline();
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-rose-100 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-95"
              >
                <IoCloseOutline size={14} />
                Decline
              </button>
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-rose-500 transition-all duration-300"
        >
          <IoTrashOutline size={18} />
        </button>
      </div>
    </motion.div>
  );
}
