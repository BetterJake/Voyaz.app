import React from "react";
import { IoGlobeOutline } from "react-icons/io5";
interface ProfileTabsProps {
  activeTab: "trips" | "map";
  setActiveTab: (tab: "trips" | "map") => void;
}
export function ProfileTabs({ activeTab, setActiveTab }: ProfileTabsProps) {
  return (
    <div className="mt-12 flex items-center justify-center gap-2 p-1.5 bg-white rounded-[28px] border border-gray-100 shadow-sm w-fit mx-auto overflow-hidden">
      <button
        onClick={() => setActiveTab("trips")}
        className={`px-12 py-3.5 rounded-[22px] text-sm font-black uppercase tracking-widest transition-all ${
          activeTab === "trips"
            ? "bg-primary text-white shadow-lg shadow-primary/25"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        Trips
      </button>
      <button
        onClick={() => setActiveTab("map")}
        className={`px-12 py-3.5 rounded-[22px] text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
          activeTab === "map"
            ? "bg-primary text-white shadow-lg shadow-primary/25"
            : "text-gray-300 hover:text-gray-400"
        }`}
      >
        World Map
        <IoGlobeOutline className="text-sm" />
      </button>
    </div>
  );
}
