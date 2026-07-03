import { useEffect } from "react";
import { useSmoothScroll } from "@/context/SmoothScrollContext";

export const useScrollLock = (lock: boolean) => {
  const { lenis } = useSmoothScroll();

  useEffect(() => {
    if (!lock) return;

    // Use Lenis to stop scrolling if available, which prevents jumping to top
    if (lenis) {
      lenis.stop();
      return () => {
        lenis.start();
      };
    }

    // Fallback manual scroll lock
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [lock, lenis]);
};
