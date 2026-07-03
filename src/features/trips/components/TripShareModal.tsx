"use client";
import React, { useState, useEffect } from "react";
import {
  IoLockClosedOutline,
  IoPeopleOutline,
  IoGlobeOutline,
  IoCopyOutline,
  IoCheckmarkCircle,
  IoLinkOutline,
  IoPersonAddOutline,
  IoGitBranchOutline,
  IoAlertCircleOutline,
} from "react-icons/io5";
import { Modal } from "@/components/ui/Modal";
import { Trip } from "../types";
import * as API from "../api/trips";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

import { useRouter } from "next/navigation";

interface TripShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onUpdate?: (updatedTrip: Trip) => void;
  onForkSuccess?: () => void;
}

type ForkState = "idle" | "loading" | "success" | "error";

export function TripShareModal({
  isOpen,
  onClose,
  trip,
  onUpdate,
  onForkSuccess,
}: TripShareModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [visibility, setVisibility] = useState(trip.visibility || "public");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [forkState, setForkState] = useState<ForkState>("idle");
  const [forkError, setForkError] = useState<string | null>(null);

  const isOwner = user?.id === trip.user_id;
  const supabase = createClient();

  useEffect(() => {
    if (isOpen && isOwner) {
      fetchFriends();
    }
    // Reset fork state when modal opens/closes
    if (!isOpen) {
      setForkState("idle");
      setForkError(null);
    }
  }, [isOpen, isOwner]);

  const fetchFriends = async () => {
    if (!user) return;
    setIsLoadingFriends(true);
    try {
      const { data, error } = await supabase
        .from("friendships")
        .select(
          `
          friend_id,
          user_id,
          profiles!friendships_friend_id_fkey (id, username, avatar_url),
          profiles_user:profiles!friendships_user_id_fkey (id, username, avatar_url)
        `
        )
        .eq("status", "accepted")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);
      if (error) throw error;
      const formattedFriends = data
        .map((f) => {
          const isUserFriend = f.friend_id === user.id;
          return isUserFriend ? f.profiles_user : f.profiles;
        })
        .filter((p) => p && (p as any).id !== user.id);
      setFriends(formattedFriends);
    } catch (err) {
      console.error("Failed to fetch friends:", err);
    } finally {
      setIsLoadingFriends(false);
    }
  };

  const handleVisibilityChange = async (newVisibility: any) => {
    setIsUpdating(true);
    try {
      await API.updateTripVisibility(trip.id, newVisibility);
      setVisibility(newVisibility);
      if (onUpdate) onUpdate({ ...trip, visibility: newVisibility });
    } catch (err) {
      console.error("Failed to update visibility:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/plan-trip?tripId=${trip.id}`;
    navigator.clipboard.writeText(url);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };

  const handleShareWithFriend = async (friendId: string) => {
    try {
      await API.shareTrip(trip.id, friendId, "view");
      setSharedWith((prev) => [...prev, friendId]);
    } catch (err: any) {
      console.error("Failed to share trip:", err);
      // Let's log more details if available
      if (err.message) console.error("Error message:", err.message);
      if (err.details) console.error("Error details:", err.details);
      if (err.hint) console.error("Error hint:", err.hint);
    }
  };

  const handleFork = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setForkState("loading");
    setForkError(null);
    try {
      await API.forkTrip(user.id, trip);

      // Invalidate trips query to update UI immediately
      queryClient.invalidateQueries({ queryKey: ["trips"] });

      setForkState("success");
      onForkSuccess?.();
    } catch (err: any) {
      console.error("Fork failed:", err);
      setForkState("error");
      setForkError(err?.message || "Failed to fork trip. Please try again.");
    }
  };

  const handleCloseAfterSuccess = () => {
    setForkState("idle");
    onClose();
  };

  const visibilityOptions = [
    {
      id: "public",
      label: "Public",
      icon: IoGlobeOutline,
      desc: "Anyone can discover and fork this trip.",
    },
    {
      id: "friends",
      label: "Friends",
      icon: IoPeopleOutline,
      desc: "Only your friends can see this trip.",
    },
    {
      id: "private",
      label: "Private",
      icon: IoLockClosedOutline,
      desc: "Only you and people you share it with.",
    },
  ];

  // Success screen
  if (forkState === "success") {
    return (
      <Modal isOpen={isOpen} onClose={handleCloseAfterSuccess} title="Fork Successful">
        <div className="flex flex-col items-center text-center gap-6 py-4">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
            <IoGitBranchOutline size={40} className="text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Trip Forked!</h3>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              <span className="font-bold text-gray-900">&quot;{trip.title}&quot;</span> has been
              copied to your profile as a private trip. You can now edit it freely.
            </p>
          </div>
          <div className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Forked from
            </p>
            <p className="text-sm font-bold text-gray-900">{trip.title}</p>
          </div>
          <button
            onClick={handleCloseAfterSuccess}
            className="w-full py-4 bg-gray-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all"
          >
            Go to My Trips
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Voyage">
      <div className="space-y-8">
        {isOwner && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Visibility
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {visibilityOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleVisibilityChange(opt.id)}
                  disabled={isUpdating}
                  className={`flex items-center gap-4 p-4 rounded-3xl border transition-all text-left ${
                    visibility === opt.id
                      ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100"
                      : "bg-gray-50 border-gray-100 text-gray-900 hover:border-blue-200"
                  }`}
                >
                  <opt.icon
                    size={24}
                    className={visibility === opt.id ? "text-white" : "text-blue-500"}
                  />
                  <div>
                    <p className="font-black uppercase tracking-tight text-sm">{opt.label}</p>
                    <p
                      className={`text-[10px] font-bold leading-tight mt-0.5 ${visibility === opt.id ? "text-blue-100" : "text-gray-400"}`}
                    >
                      {opt.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Actions
          </h3>

          {forkState === "error" && forkError && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600">
              <IoAlertCircleOutline size={20} className="shrink-0" />
              <p className="text-[11px] font-bold leading-snug">{forkError}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-3 bg-white border border-gray-100 p-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:border-blue-200 transition-all group"
            >
              {showCopySuccess ? (
                <IoCheckmarkCircle className="text-emerald-500" size={16} />
              ) : (
                <IoLinkOutline size={16} />
              )}
              {showCopySuccess ? "Copied" : "Copy Link"}
            </button>

            {!isOwner && (
              <button
                onClick={handleFork}
                disabled={forkState === "loading"}
                className="flex items-center justify-center gap-3 bg-gray-900 text-white p-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {forkState === "loading" ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Forking...
                  </>
                ) : (
                  <>
                    <IoGitBranchOutline size={16} />
                    Fork Trip
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {isOwner && visibility !== "public" && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Share with friends
            </h3>
            <div className="max-h-[200px] overflow-y-auto no-scrollbar space-y-2">
              {isLoadingFriends ? (
                <div className="py-8 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                  Finding friends...
                </div>
              ) : friends.length === 0 ? (
                <div className="p-6 bg-gray-50 rounded-[2rem] text-center border border-dashed border-gray-200">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                    No friends found.
                    <br />
                    Connect with travelers to share trips directly.
                  </p>
                </div>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                        <img
                          src={
                            friend.avatar_url ||
                            `https://ui-avatars.com/api/?name=${friend.username}`
                          }
                          alt={friend.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="font-black text-xs uppercase tracking-tight text-gray-900">
                        @{friend.username}
                      </p>
                    </div>
                    <button
                      onClick={() => handleShareWithFriend(friend.id)}
                      disabled={sharedWith.includes(friend.id)}
                      className={`p-2 rounded-xl transition-all ${
                        sharedWith.includes(friend.id)
                          ? "bg-emerald-50 text-emerald-500"
                          : "bg-white text-blue-600 shadow-sm hover:scale-110 active:scale-95"
                      }`}
                    >
                      {sharedWith.includes(friend.id) ? (
                        <IoCheckmarkCircle size={20} />
                      ) : (
                        <IoPersonAddOutline size={20} />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
