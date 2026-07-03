"use client";

import { Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/react-query";
import { APIProvider } from "@vis.gl/react-google-maps";
import { AuthProvider } from "@/context/AuthContext";
import { PreferencesProvider } from "@/context/PreferencesContext";
import { AblyProvider } from "@/context/AblyContext";
import { FavouritesProvider } from "@/context/FavouritesContext";
import { TripProvider } from "@/context/TripContext";
import SmoothScroll from "@/components/SmoothScroll";
import RealtimeToastManager from "@/components/RealtimeToastManager";
import ActiveTripNavOverlay from "@/components/ActiveTripNavOverlay";

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

if (process.env.NODE_ENV === "development" && !GOOGLE_MAPS_KEY) {
  console.warn("WARNING: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not defined!");
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <APIProvider apiKey={GOOGLE_MAPS_KEY}>
        <AuthProvider>
          <PreferencesProvider>
            <AblyProvider>
              <FavouritesProvider>
                <Suspense fallback={null}>
                  <TripProvider>
                    <SmoothScroll>
                      <RealtimeToastManager />
                      {children}
                      <ActiveTripNavOverlay />
                    </SmoothScroll>
                  </TripProvider>
                </Suspense>
              </FavouritesProvider>
            </AblyProvider>
          </PreferencesProvider>
        </AuthProvider>
      </APIProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
