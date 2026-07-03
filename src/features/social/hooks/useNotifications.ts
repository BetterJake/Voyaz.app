import { useState, useEffect, useCallback } from "react";
import * as Notifications from "../api/notifications";
import { SocialNotification } from "../types";
import { useAbly } from "@/hooks/useAbly";
export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const data = await Notifications.getNotifications(userId);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  const handleNewMessage = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  const { publishToUser } = useAbly(userId, handleNewMessage);
  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications((prev: SocialNotification[]) =>
        prev.map((n: SocialNotification) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev: number) => Math.max(0, prev - 1));
      await Notifications.markAsRead(notificationId);
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };
  const markAllAsRead = async () => {
    if (!userId) return;
    try {
      setNotifications((prev: SocialNotification[]) =>
        prev.map((n: SocialNotification) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      await Notifications.markAllAsRead(userId);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };
  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications((prev: SocialNotification[]) =>
        prev.filter((n: SocialNotification) => n.id !== notificationId)
      );
      await Notifications.remove(notificationId);
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };
  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: fetchNotifications,
    triggerRealtime: publishToUser,
  };
}
