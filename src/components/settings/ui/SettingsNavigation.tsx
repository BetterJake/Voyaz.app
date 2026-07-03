import React from "react";
import { motion } from "framer-motion";
import {
  IoPersonOutline,
  IoAirplaneOutline,
  IoDocumentTextOutline,
  IoShieldOutline,
  IoHelpCircleOutline,
  IoLockClosedOutline,
  IoLogOutOutline,
  IoBanOutline,
} from "react-icons/io5";
import { TabType } from "../types";
import Link from "next/link";
interface SettingsNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  handleLogout: () => void;
  onSupportClick: () => void;
}
export function SettingsNavigation({
  activeTab,
  setActiveTab,
  handleLogout,
  onSupportClick,
}: SettingsNavigationProps) {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: "profile",
      label: "Profile",
      icon: <IoPersonOutline className="text-lg relative z-10" />,
    },
    {
      id: "travel",
      label: "Travel Preferences",
      icon: <IoAirplaneOutline className="text-lg relative z-10" />,
    },
    {
      id: "privacy",
      label: "Privacy & Data",
      icon: <IoDocumentTextOutline className="text-lg relative z-10" />,
    },
    {
      id: "security",
      label: "Security",
      icon: <IoShieldOutline className="text-lg relative z-10" />,
    },
    {
      id: "blocked",
      label: "Blocked Users",
      icon: <IoBanOutline className="text-lg relative z-10" />,
    },
  ];
  return (
    <div className="flex md:flex-col gap-2 relative overflow-x-auto md:overflow-visible pb-4 md:pb-0 no-scrollbar">
      {" "}
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center justify-center md:justify-start gap-3 px-6 md:px-4 py-3 text-sm font-bold rounded-xl transition-colors whitespace-nowrap ${isActive ? "text-white" : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"}`}
          >
            {" "}
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-primary rounded-xl shadow-md"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}{" "}
            {tab.icon} <span className="relative z-10">{tab.label}</span>{" "}
          </button>
        );
      })}{" "}
      <div className="hidden md:block w-full h-px bg-gray-200 my-2" />{" "}
      <div className="hidden md:flex flex-col gap-4 px-2 pb-4">
        {" "}
        <button
          onClick={onSupportClick}
          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-700 uppercase tracking-wider text-left transition-colors"
        >
          {" "}
          <IoHelpCircleOutline className="text-base" /> Contact Support{" "}
        </button>{" "}
        <Link
          href="/terms"
          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-700 uppercase tracking-wider transition-colors"
        >
          {" "}
          <IoDocumentTextOutline className="text-base" /> Terms{" "}
        </Link>{" "}
        <Link
          href="/privacy"
          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-700 uppercase tracking-wider transition-colors"
        >
          {" "}
          <IoLockClosedOutline className="text-base" /> Privacy{" "}
        </Link>{" "}
      </div>{" "}
      <button
        onClick={handleLogout}
        className="relative flex items-center justify-center md:justify-start gap-3 px-6 md:px-4 py-3 text-sm font-bold rounded-xl text-red-600 hover:bg-red-50"
      >
        {" "}
        <IoLogOutOutline className="text-lg" /> <span>Log Out</span>{" "}
      </button>{" "}
    </div>
  );
}
