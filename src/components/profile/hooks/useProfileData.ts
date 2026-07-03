import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { ConnectionStatus } from "@/features/social/types";
import { useAbly } from "@/hooks/useAbly";
export function useProfileData(targetUserId: string, currentUserId?: string) {
  const [friendsCount, setFriendsCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("none");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const supabase = createClient();
  const fetchSocialData = useCallback(async () => {
    if (!targetUserId) return;
    setIsDataLoading(true);
    try {
      const [friendsResponse, followersResponse] = await Promise.all([
        supabase
          .from("friendships")
          .select("*", { count: "exact", head: true })
          .eq("status", "accepted")
          .or(`user_id.eq.${targetUserId},friend_id.eq.${targetUserId}`),
        supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("following_id", targetUserId),
      ]);
      setFriendsCount(friendsResponse.count || 0);
      setFollowersCount(followersResponse.count || 0);
      if (currentUserId && currentUserId !== targetUserId) {
        const { data: block } = await supabase
          .from("blocks")
          .select("*")
          .or(
            `and(blocker_id.eq.${currentUserId},blocked_id.eq.${targetUserId}),and(blocker_id.eq.${targetUserId},blocked_id.eq.${currentUserId})`
          )
          .maybeSingle();
        if (block) {
          setIsBlocked(true);
          return;
        }
        const { data: friendship } = await supabase
          .from("friendships")
          .select("*")
          .or(
            `and(user_id.eq.${currentUserId},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${currentUserId})`
          )
          .maybeSingle();
        if (friendship) {
          if (friendship.status === "accepted") setConnectionStatus("accepted");
          else if (friendship.user_id === currentUserId) setConnectionStatus("pending");
          else setConnectionStatus("incoming_pending");
        } else {
          setConnectionStatus("none");
        }
        const { data: follow } = await supabase
          .from("follows")
          .select("*")
          .eq("follower_id", currentUserId)
          .eq("following_id", targetUserId)
          .maybeSingle();
        setIsFollowing(!!follow);
      }
    } catch (err) {
      console.error("Error fetching profile social data:", err);
    } finally {
      setIsDataLoading(false);
    }
  }, [targetUserId, currentUserId]);
  useEffect(() => {
    fetchSocialData();
  }, [fetchSocialData]);
  useAbly(currentUserId, (message) => {
    if (message.name === "notification" || message.name === "sync") {
      fetchSocialData();
    }
  });
  return {
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
    refresh: fetchSocialData,
  };
}
