import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoShareOutline,
  IoEllipsisHorizontal,
  IoLockClosedOutline,
  IoPencil,
  IoPersonAddOutline,
  IoRadioOutline,
  IoBanOutline,
} from "react-icons/io5";
import Link from "next/link";
import { ConnectionStatus, ProfileUser } from "@/features/social/types";
import { CONTAINER_VARIANTS, MENU_VARIANTS } from "@/features/social/constants";
interface ProfileHeaderProps {
  user: ProfileUser;
  isPublic: boolean;
  currentUserId?: string;
  targetUserId: string;
  connectionStatus: ConnectionStatus;
  isFollowing: boolean;
  friendsCount: number;
  followersCount: number;
  tripsCount: number;
  isLoading: boolean;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onShare: () => void;
  onFriendAction: () => void;
  onFollowAction: () => void;
  onBlockAction: () => void;
  onReportAction: () => void;
  onShowSocialList: (type: "friends" | "followers") => void;
}
export function ProfileHeader({
  user,
  isPublic,
  currentUserId,
  targetUserId,
  connectionStatus,
  isFollowing,
  friendsCount,
  followersCount,
  tripsCount,
  isLoading,
  isMenuOpen,
  setIsMenuOpen,
  menuRef,
  onShare,
  onFriendAction,
  onFollowAction,
  onBlockAction,
  onReportAction,
  onShowSocialList,
}: ProfileHeaderProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={CONTAINER_VARIANTS}
      className="relative -mt-24 md:-mt-32 backdrop-blur-3xl bg-white/80 border border-white/50 rounded-[32px] md:rounded-[40px] p-6 md:p-12 shadow-2xl shadow-gray-200/50 z-20"
    >
      <div className="flex flex-col md:flex-row items-center md:items-center gap-8">
        <div className="relative">
          <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-[6px] border-white shadow-xl overflow-hidden bg-gray-100">
            <img
              src={
                user.avatarUrl ||
                `https://ui-avatars.com/api/?name=${user.username}&background=random`
              }
              alt={user.username}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex-1 text-center md:text-left min-w-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="min-w-0">
              <h1
                className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 leading-tight truncate"
                title={`${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username}
              >
                {user.first_name || user.last_name
                  ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                  : user.username}
              </h1>
              <p className="text-gray-500 font-bold tracking-tight text-lg truncate">
                @{user.username.toLowerCase().replace(/\s+/g, "_")}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-3 relative shrink-0">
              <button
                onClick={onShare}
                className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors"
                title="Share Profile"
              >
                <IoShareOutline className="text-lg md:text-xl text-gray-700" />
              </button>
              {isPublic && (
                <>
                  <button
                    onClick={onFollowAction}
                    className={`px-4 py-2.5 md:px-6 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all ${
                      isFollowing
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                    }`}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
                  <button
                    onClick={onFriendAction}
                    className={`px-4 py-2.5 md:px-6 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all ${
                      connectionStatus === "accepted"
                        ? "bg-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50"
                        : connectionStatus === "pending" || connectionStatus === "incoming_pending"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-gray-900 text-white shadow-lg shadow-gray-200 hover:scale-105 active:scale-95"
                    }`}
                  >
                    {connectionStatus === "none" && "Add Friend"}
                    {connectionStatus === "pending" && "Cancel"}
                    {connectionStatus === "incoming_pending" && "Accept"}
                    {connectionStatus === "accepted" && "Unfriend"}
                  </button>
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl transition-all ${isMenuOpen ? "bg-gray-900 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                    >
                      <IoEllipsisHorizontal className="text-lg md:text-xl" />
                    </button>
                    <AnimatePresence>
                      {isMenuOpen && (
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={MENU_VARIANTS}
                          className="absolute right-0 mt-3 w-48 md:w-56 bg-white/90 backdrop-blur-xl border border-gray-100 rounded-2xl p-2 shadow-2xl z-50 overflow-hidden"
                        >
                          <button
                            onClick={onBlockAction}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors"
                          >
                            <IoBanOutline className="text-lg" /> Block User
                          </button>
                          <button
                            onClick={onReportAction}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors"
                          >
                            Report User
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
              {!isPublic && (
                <Link
                  href="/settings"
                  className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  <IoPencil className="text-lg md:text-xl" />
                </Link>
              )}
            </div>
          </div>
          <p className="mt-4 text-gray-700 text-lg font-medium max-w-xl break-words whitespace-pre-wrap">
            {user.bio ||
              (isPublic
                ? "No travel philosophy shared yet."
                : "Exploring the world one pixel at a time. Finding stories behind every destination ✈️")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-8 md:gap-12">
            <div className="text-center md:text-left">
              <p className="text-xl md:text-2xl font-black text-gray-900">{tripsCount}</p>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                Trips
              </p>
            </div>
            <button
              onClick={() => onShowSocialList("friends")}
              className="text-center md:text-left border-l border-gray-100 pl-8 md:pl-12 group transition-all"
            >
              <p className="text-xl md:text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">
                {isLoading ? "..." : friendsCount}
              </p>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-primary transition-colors flex items-center gap-2">
                Friends
                {isPublic && user.show_friends === false && (
                  <IoLockClosedOutline className="text-[10px]" />
                )}
              </p>
            </button>
            <button
              onClick={() => onShowSocialList("followers")}
              className="text-center md:text-left border-l border-gray-100 pl-8 md:pl-12 group transition-all"
            >
              <p className="text-xl md:text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">
                {isLoading ? "..." : followersCount}
              </p>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-primary transition-colors flex items-center gap-2">
                Followers
                {isPublic && user.show_followers === false && (
                  <IoLockClosedOutline className="text-[10px]" />
                )}
              </p>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
