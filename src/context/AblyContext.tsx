"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import * as Ably from "ably";
import { useAuth } from "./AuthContext";

interface AblyContextType {
  realtime: Ably.Realtime | null;
}

const AblyContext = createContext<AblyContextType>({ realtime: null });

export const useAblyContext = () => useContext(AblyContext);

export const AblyProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [realtime, setRealtime] = useState<Ably.Realtime | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (user && !realtime) {
      // Probe the auth endpoint first so a deployment without an Ably key
      // degrades to "no realtime" instead of endless reconnect attempts.
      fetch("/api/ably/auth")
        .then((res) => {
          if (cancelled) return;
          if (res.ok) {
            setRealtime(new Ably.Realtime({ authUrl: "/api/ably/auth" }));
          } else {
            console.warn("[Ably] Realtime features disabled: auth endpoint returned", res.status);
          }
        })
        .catch((err) => {
          if (!cancelled) console.warn("[Ably] Realtime features disabled:", err);
        });
    }

    // Cleanup when user logs out or component unmounts
    if (!user && realtime) {
      realtime.close();
      setRealtime(null);
    }

    return () => {
      cancelled = true;
    };
  }, [user, realtime]);

  // Final cleanup on unmount
  useEffect(() => {
    return () => {
      if (realtime) {
        realtime.close();
      }
    };
  }, [realtime]);

  return <AblyContext.Provider value={{ realtime }}>{children}</AblyContext.Provider>;
};
