"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import Lenis from "lenis";
interface SmoothScrollContextType {
  lenis: Lenis | null;
  setLenis: (lenis: Lenis | null) => void;
}
const SmoothScrollContext = createContext<SmoothScrollContextType | undefined>(undefined);
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  return (
    <SmoothScrollContext.Provider value={{ lenis, setLenis }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
export function useSmoothScroll() {
  const context = useContext(SmoothScrollContext);
  if (context === undefined) {
    throw new Error("useSmoothScroll must be used within a SmoothScrollProvider");
  }
  return context;
}
