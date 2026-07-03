import React from "react";
import Link from "next/link";
interface ProfileHeroProps {
  bannerUrl?: string;
  isPublic: boolean;
}
export function ProfileHero({ bannerUrl, isPublic }: ProfileHeroProps) {
  return (
    <div className="relative h-64 md:h-96 w-full overflow-hidden">
      <img
        src={
          bannerUrl ||
          "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
        }
        alt="Cover"
        className="w-full h-full object-cover transition-transform duration-1000"
      />
      <div className="absolute inset-0 bg-black/20" />
      {!isPublic && (
        <Link
          href="/settings"
          className="absolute top-8 right-8 bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/30 transition-all flex items-center gap-2 z-10"
        >
          Edit cover image
        </Link>
      )}
    </div>
  );
}
