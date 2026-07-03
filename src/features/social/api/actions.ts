import { ConnectionStatus } from "../types";
import * as Notifications from "./notifications";
import { createClient } from "@/utils/supabase/client";
const supabase = createClient();
export async function handleFriendship(
  currentUserId: string,
  targetUserId: string,
  status: ConnectionStatus
): Promise<ConnectionStatus> {
  if (status === "none") {
    const { error } = await supabase
      .from("friendships")
      .insert({ user_id: currentUserId, friend_id: targetUserId, status: "pending" });
    if (error) throw error;
    await Notifications.trigger(targetUserId, "friend_request");
    return "pending";
  }
  if (status === "pending") {
    const { error } = await supabase
      .from("friendships")
      .delete()
      .or(
        `and(user_id.eq.${currentUserId},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${currentUserId})`
      );
    if (error) throw error;
    await Notifications.trigger(targetUserId, "friend_request_cancel").catch(() => {});
    return "none";
  }
  if (status === "incoming_pending") {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("user_id", targetUserId)
      .eq("friend_id", currentUserId);
    if (error) throw error;
    await Notifications.trigger(targetUserId, "friend_accept");
    return "accepted";
  }
  const { error } = await supabase
    .from("friendships")
    .delete()
    .or(
      `and(user_id.eq.${currentUserId},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${currentUserId})`
    );
  if (error) throw error;
  return "none";
}
export async function declineFriendship(currentUserId: string, targetUserId: string) {
  const { error } = await supabase
    .from("friendships")
    .delete()
    .or(
      `and(user_id.eq.${currentUserId},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${currentUserId})`
    );
  if (error) throw error;
}
export async function toggleFollow(
  currentUserId: string,
  targetUserId: string,
  isCurrentlyFollowing: boolean
): Promise<boolean> {
  if (!isCurrentlyFollowing) {
    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: currentUserId, following_id: targetUserId });
    if (error) throw error;
    await Notifications.trigger(targetUserId, "new_follower");
    return true;
  }
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", currentUserId)
    .eq("following_id", targetUserId);
  if (error) throw error;
  return false;
}
export async function block(currentUserId: string, targetUserId: string) {
  await supabase.from("blocks").insert({ blocker_id: currentUserId, blocked_id: targetUserId });
  await supabase
    .from("friendships")
    .delete()
    .or(
      `and(user_id.eq.${currentUserId},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${currentUserId})`
    );
  await supabase
    .from("follows")
    .delete()
    .or(
      `and(follower_id.eq.${currentUserId},following_id.eq.${targetUserId}),and(follower_id.eq.${targetUserId},following_id.eq.${currentUserId})`
    );
}

export async function unblock(currentUserId: string, targetUserId: string) {
  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("blocker_id", currentUserId)
    .eq("blocked_id", targetUserId);
  if (error) throw error;
}

export async function report(currentUserId: string, targetUserId: string, reason: string) {
  return supabase.from("reports").insert({
    reporter_id: currentUserId,
    reported_id: targetUserId,
    reason,
  });
}
