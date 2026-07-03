import * as Actions from "../api/actions";
import { ConnectionStatus } from "../types";
import { createClient } from "@/utils/supabase/client";

interface SocialActionsProps {
  currentUserId?: string;
  targetUserId: string;
  onSuccess?: (msg: string) => void;
  onError?: (msg: string) => void;
}

export function useSocialActions({
  currentUserId,
  targetUserId,
  onSuccess,
  onError,
}: SocialActionsProps) {
  const supabase = createClient();

  const handleFriendAction = async (status: ConnectionStatus) => {
    if (!currentUserId) {
      onError?.("Login required.");
      return;
    }
    try {
      const nextStatus = await Actions.handleFriendship(currentUserId, targetUserId, status);
      const messages: Record<string, string> = {
        pending: "Friend request sent!",
        none: "Action cancelled.",
        accepted: "Friend request accepted!",
      };
      onSuccess?.(messages[nextStatus] || "Action completed.");
      return nextStatus;
    } catch {
      onError?.("Friend action failed.");
      return status;
    }
  };

  const handleFollowAction = async (isCurrentlyFollowing: boolean) => {
    if (!currentUserId) {
      onError?.("Login required.");
      return;
    }
    try {
      const result = await Actions.toggleFollow(currentUserId, targetUserId, isCurrentlyFollowing);
      onSuccess?.(result ? "Following user" : "Unfollowed user");
      return result;
    } catch {
      onError?.("Follow action failed.");
      return isCurrentlyFollowing;
    }
  };

  const handleDecline = async () => {
    if (!currentUserId) return;
    try {
      await Actions.declineFriendship(currentUserId, targetUserId);
      onSuccess?.("Friend request ignored.");
    } catch {
      onError?.("Failed to ignore friend request.");
    }
  };

  const submitReport = async (reason: string) => {
    if (!currentUserId || !reason.trim()) return;
    try {
      await Actions.report(currentUserId, targetUserId, reason);
      onSuccess?.("Report submitted.");
    } catch {
      onError?.("Report failed.");
    }
  };

  const confirmBlock = async () => {
    if (!currentUserId) return;
    try {
      await Actions.block(currentUserId, targetUserId);
      onSuccess?.("User blocked.");
    } catch {
      onError?.("Block failed.");
    }
  };

  const unblockUser = async (blockedUserId?: string) => {
    const idToUnblock = blockedUserId || targetUserId;
    if (!currentUserId || !idToUnblock) return;
    try {
      await Actions.unblock(currentUserId, idToUnblock);
      onSuccess?.("User unblocked.");
    } catch (err) {
      onError?.("Unblock failed.");
      throw err;
    }
  };

  const handleAcceptTripShare = async (tripId: string) => {
    if (!currentUserId) return;
    try {
      const { error } = await supabase
        .from("trip_shares")
        .update({ status: "accepted" })
        .eq("trip_id", tripId)
        .eq("shared_with_id", currentUserId);
      if (error) throw error;
      onSuccess?.("Trip invitation accepted!");
      return true;
    } catch {
      onError?.("Failed to accept trip.");
      return false;
    }
  };

  const handleDeclineTripShare = async (tripId: string) => {
    if (!currentUserId) return;
    try {
      const { error } = await supabase
        .from("trip_shares")
        .update({ status: "declined" })
        .eq("trip_id", tripId)
        .eq("shared_with_id", currentUserId);
      if (error) throw error;
      onSuccess?.("Trip invitation declined.");
      return true;
    } catch {
      onError?.("Failed to decline trip.");
      return false;
    }
  };

  return {
    handleFriendAction,
    handleFollowAction,
    handleDecline,
    submitReport,
    confirmBlock,
    unblockUser,
    handleAcceptTripShare,
    handleDeclineTripShare,
  };
}
