"use client";

import { useEffect, useRef } from "react";
import * as Ably from "ably";
import { useAblyContext } from "@/context/AblyContext";

export function useAbly(userId: string | undefined, onMessage: (message: Ably.Message) => void) {
  const { realtime } = useAblyContext();
  const onMessageRef = useRef(onMessage);

  // Update the ref whenever onMessage changes without triggering useEffect
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!userId || !realtime) return;

    const channel = realtime.channels.get(`user-notifications:${userId}`);

    const listener = (message: Ably.Message) => {
      onMessageRef.current(message);
    };

    channel.subscribe(listener);

    return () => {
      try {
        if (channel) {
          channel.unsubscribe(listener);
        }
      } catch (err) {
        console.warn("Error during Ably channel unsubscribe:", err);
      }
    };
  }, [userId, realtime]); // Removed onMessage from dependencies

  const publishToUser = async (targetUserId: string, data: any) => {
    if (!realtime || !targetUserId) return;
    try {
      const channel = realtime.channels.get(`user-notifications:${targetUserId}`);
      await channel.publish("notification", data);
    } catch (err) {
      console.error("Failed to publish to Ably channel:", err);
    }
  };

  return { realtime, publishToUser };
}
