"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoBanOutline, IoCheckmarkCircle } from "react-icons/io5";
import { useTrips } from "@/hooks/useTrips";
import { createClient } from "@/utils/supabase/client";
import { WorldMap } from "@/components/profile/WorldMap";
import { ProfileHero } from "./components/ProfileHero";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileTabs } from "./components/ProfileTabs";
import { TripGrid } from "./components/TripGrid";
import TripDetailOverlay from "@/components/TripDetailOverlay";
import { SocialModals } from "@/features/social/components/SocialModals";
import { useSocialActions } from "@/features/social/hooks/useSocialActions";
import { useProfileData } from "./hooks/useProfileData";
import { ProfileClientProps, SocialListState } from "@/features/social/types";
import { TOAST_DURATION } from "@/features/social/constants";
import { Trip } from "@/hooks/useTrips";
export function ProfileClient({
  user,
  isPublic = false,
  targetUserId,
  currentUserId,
}: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<"trips" | "map">("trips");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [socialListModal, setSocialListModal] = useState<SocialListState>({
    isOpen: false,
    title: "",
    users: [],
    isLoading: false,
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const { trips, isLoading: isTripsLoading } = useTrips({ targetUserId });
  const supabase = createClient();
  const profileProps = useProfileData(targetUserId, currentUserId);
  const {
    friendsCount,
    setFriendsCount,
    followersCount,
    setFollowersCount,
    connectionStatus,
    setConnectionStatus,
    isFollowing,
    setIsFollowing,
    isBlocked,
    setIsBlocked,
    isDataLoading,
  } = profileProps;
  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), TOAST_DURATION);
  };
  const socialActions = useSocialActions({
    currentUserId,
    targetUserId,
    onSuccess: triggerToast,
    onError: triggerToast,
  });
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleShare = async () => {
    const shareData = {
      title: `${user.username} on Voyaz`,
      text: `Explore travel stories from ${user.username} on Voyaz.`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== "AbortError") copyToClipboard();
      }
    } else copyToClipboard();
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    triggerToast("Link copied to clipboard");
    setIsMenuOpen(false);
  };
  const onShowSocialList = async (type: "friends" | "followers") => {
    const isOwner = currentUserId === targetUserId;
    const canSee =
      isOwner || (type === "friends" ? user.show_friends !== false : user.show_followers !== false);
    if (!canSee) return triggerToast("Connections are private.");
    setSocialListModal((prev) => ({
      ...prev,
      isOpen: true,
      title: type === "friends" ? "Friends" : "Followers",
      isLoading: true,
      users: [],
    }));
    try {
      let users: any[] = [];
      if (type === "friends") {
        const { data } = await supabase
          .from("friendships")
          .select(
            "user_id, friend_id, profiles_user:user_id (id, username, avatar_url), profiles_friend:friend_id (id, username, avatar_url)"
          )
          .eq("status", "accepted")
          .or(`user_id.eq.${targetUserId},friend_id.eq.${targetUserId}`);
        users = (data || []).map((f) =>
          f.user_id === targetUserId ? f.profiles_friend : f.profiles_user
        );
      } else {
        const { data } = await supabase
          .from("follows")
          .select("follower_id, profiles_follower:follower_id (id, username, avatar_url)")
          .eq("following_id", targetUserId);
        users = (data || []).map((f) => f.profiles_follower);
      }
      setSocialListModal((prev) => ({ ...prev, users, isLoading: false }));
    } catch {
      triggerToast("Failed to load list.");
      setSocialListModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
    }
  };
  const handleListAction = async (userId: string, type: "unfriend" | "unfollow") => {
    try {
      if (type === "unfriend") {
        await supabase
          .from("friendships")
          .delete()
          .or(
            `and(user_id.eq.${currentUserId},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${currentUserId})`
          );
        await supabase
          .from("notifications")
          .delete()
          .eq("actor_id", currentUserId)
          .eq("recipient_id", userId)
          .eq("type", "friend_request");
        triggerToast("Removed from friends.");
      } else {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", userId);
        triggerToast("Unfollowed user");
      }
      setSocialListModal((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u.id !== userId),
      }));
      if (userId === targetUserId) {
        if (type === "unfriend") {
          setConnectionStatus("none");
          setFriendsCount((prev) => Math.max(0, prev - 1));
        } else {
          setIsFollowing(false);
          setFollowersCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      triggerToast("Action failed.");
    }
  };
  if (isBlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[40px] shadow-2xl text-center max-w-md border border-gray-100"
        >
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <IoBanOutline size={40} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900 mb-4">
            Profile Unavailable
          </h2>
          <p className="text-gray-500 font-medium mb-8">
            This profile is not available due to a block.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-colors"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] bg-gray-900/90 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <IoCheckmarkCircle className="text-green-400 text-xl" />
            <span className="text-white text-sm font-bold uppercase tracking-widest">
              {toastMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <ProfileHero bannerUrl={user.bannerUrl} isPublic={isPublic} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProfileHeader
          user={user}
          isPublic={isPublic}
          currentUserId={currentUserId}
          targetUserId={targetUserId}
          connectionStatus={connectionStatus}
          isFollowing={isFollowing}
          friendsCount={friendsCount}
          followersCount={followersCount}
          tripsCount={trips.length}
          isLoading={isDataLoading}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          menuRef={menuRef}
          onShare={handleShare}
          onFriendAction={async () => {
            const nextStatus = await socialActions.handleFriendAction(connectionStatus);
            if (nextStatus) setConnectionStatus(nextStatus);
          }}
          onFollowAction={async () => {
            const nextFollow = await socialActions.handleFollowAction(isFollowing);
            if (nextFollow !== undefined) setIsFollowing(nextFollow);
          }}

          onBlockAction={() => {
            setIsMenuOpen(false);
            setIsBlockModalOpen(true);
          }}
          onReportAction={() => {
            setIsMenuOpen(false);
            setIsReportModalOpen(true);
          }}
          onShowSocialList={onShowSocialList}
        />
        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-12">
          <AnimatePresence mode="wait">
            {activeTab === "trips" ? (
              <TripGrid
                key="trips"
                trips={trips}
                isLoading={isTripsLoading}
                username={user.username}
                avatarUrl={user.avatarUrl}
                onTripClick={(trip) => setSelectedTrip(trip)}
              />
            ) : (
              <WorldMap key="map" trips={trips} />
            )}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {selectedTrip && (
          <TripDetailOverlay trip={selectedTrip} onClose={() => setSelectedTrip(null)} />
        )}
      </AnimatePresence>
      <SocialModals
        username={user.username}
        isOwner={currentUserId === targetUserId}
        isBlockModalOpen={isBlockModalOpen}
        setIsBlockModalOpen={setIsBlockModalOpen}
        confirmBlock={() => socialActions.confirmBlock().then(() => setIsBlocked(true))}
        isReportModalOpen={isReportModalOpen}
        setIsReportModalOpen={setIsReportModalOpen}
        reportReason={reportReason}
        setReportReason={setReportReason}
        submitReport={() =>
          socialActions.submitReport(reportReason).then(() => setIsReportModalOpen(false))
        }
        socialListModal={socialListModal}
        setSocialListModal={setSocialListModal}
        onListAction={handleListAction}
      />
    </div>
  );
}
