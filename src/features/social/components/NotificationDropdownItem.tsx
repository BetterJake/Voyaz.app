import React from "react";
import { motion } from "framer-motion";
import { IoPersonAddOutline, IoRadioOutline, IoTimeOutline } from "react-icons/io5";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { SocialNotification } from "../types";

interface NotificationDropdownItemProps {
  notification: SocialNotification;
  onMarkAsRead: (id: string) => void;
  onClick: () => void;
  isDarkPage?: boolean;
}

export function NotificationDropdownItem({
  notification,
  onMarkAsRead,
  onClick,
  isDarkPage,
}: NotificationDropdownItemProps) {
  const handleItemClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    onClick();
  };

  return (
    <div
      onClick={handleItemClick}
      className={`relative group flex items-start gap-3 p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
        isDarkPage
          ? notification.is_read
            ? "hover:bg-white/5"
            : "bg-white/[0.03] hover:bg-white/[0.06]"
          : notification.is_read
            ? "hover:bg-gray-50"
            : "bg-primary/[0.03] hover:bg-primary/[0.06]"
      }`}
    >
      <Link
        href={`/profile/${notification.actor_id}`}
        onClick={(e) => e.stopPropagation()}
        className="relative shrink-0"
      >
        <div
          className={`w-10 h-10 rounded-xl overflow-hidden border shadow-sm ${
            isDarkPage ? "border-white/10" : "border-gray-100"
          }`}
        >
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
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center shadow-lg ${
            notification.type === "friend_request" ? "bg-blue-500" : "bg-primary"
          }`}
        >
          {notification.type === "friend_request" ? (
            <IoPersonAddOutline className="text-white text-[10px]" />
          ) : (
            <IoRadioOutline className="text-white text-[10px]" />
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${isDarkPage ? "text-white" : "text-gray-900"}`}>
          <span
            className={`font-black uppercase tracking-tight transition-colors ${isDarkPage ? "text-primary" : "text-gray-900"}`}
          >
            @{notification.actor.username}
          </span>
          <span className={`ml-1.5 font-medium ${isDarkPage ? "text-white/60" : "text-gray-500"}`}>
            {notification.type === "friend_request" && "sent you a friend request"}
            {notification.type === "new_follower" && "started following you"}
            {notification.type === "friend_accept" && "accepted your friend request"}
            {notification.type === "trip_shared" && "shared a trip with you"}
          </span>
        </p>
        <div
          className={`flex items-center gap-1.5 mt-1 font-bold text-[9px] uppercase tracking-widest shrink-0 ${
            isDarkPage ? "text-white/30" : "text-gray-300"
          }`}
        >
          <IoTimeOutline size={10} />
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
          }).toUpperCase()}
        </div>
      </div>

      {!notification.is_read && (
        <div
          className={`absolute top-4 right-4 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)] ${
            isDarkPage ? "ring-4 ring-black/0 group-hover:ring-white/5" : ""
          }`}
        />
      )}
    </div>
  );
}
