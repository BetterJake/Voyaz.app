import { createClient } from "@/utils/supabase/client";
import { SocialNotification, NotificationType } from "../types";
const supabase = createClient();
export async function getNotifications(userId: string): Promise<SocialNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select(
      `
      *,
      actor:actor_id (username, avatar_url)
    `
    )
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
export async function markAsRead(notificationId: string) {
  return supabase.from("notifications").update({ is_read: true }).eq("id", notificationId);
}
export async function markAllAsRead(userId: string) {
  return supabase.from("notifications").update({ is_read: true }).eq("recipient_id", userId);
}
export async function remove(notificationId: string) {
  return supabase.from("notifications").delete().eq("id", notificationId);
}
export async function trigger(recipientId: string, type: NotificationType, metadata?: any) {
  const response = await fetch("/api/notifications/trigger", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipientId, type, metadata }),
  });
  if (!response.ok) throw new Error("Failed to trigger notification");
  return response.json();
}

export async function sync(recipientId: string) {
  const response = await fetch("/api/notifications/trigger", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipientId, type: "sync", isSilent: true }),
  });
  if (!response.ok) throw new Error("Failed to trigger sync");
  return response.json();
}
export async function notifyNewMessage(tripId: string, tripTitle: string, messageText: string) {
  const response = await fetch("/api/chat/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tripId, tripTitle, messageText }),
  });
  if (!response.ok) {
    const err = await response.json();
    console.warn("Failed to broadcast chat notification:", err);
    return null;
  }
  return response.json();
}
