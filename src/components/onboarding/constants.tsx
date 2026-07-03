import React from "react";
import {
  IoPersonOutline,
  IoCameraOutline,
  IoAirplaneOutline,
  IoSparklesOutline,
  IoSettingsOutline,
} from "react-icons/io5";
export const STEPS = [
  { id: "welcome", title: "Welcome", icon: <IoPersonOutline /> },
  { id: "profile", title: "Profile", icon: <IoCameraOutline /> },
  { id: "travel", title: "Travel Style", icon: <IoAirplaneOutline /> },
  { id: "ai", title: "AI Context", icon: <IoSparklesOutline /> },
  { id: "settings", title: "Preferences", icon: <IoSettingsOutline /> },
] as const;
export const TRAVEL_STYLES = [
  "Budget Backpacker",
  "Comfort & Culture",
  "Luxury Resort",
  "Adventure & Nature",
];
export const TRAVEL_PACES = [
  "Relaxed (1-2 activities/day)",
  "Moderate (3-4 activities/day)",
  "Fast-paced (Packed schedule)",
];
export const COMPANIONS = ["Solo", "Couple", "Family with children", "Group of friends"];
export const ACCOMMODATIONS = ["Hotels", "Hostels", "Apartments / Airbnb", "Boutique Stays"];
export const CURRENCIES = ["USD ($)", "EUR (€)", "GBP (£)", "PLN (zł)", "JPY (¥)"];
export const THEMES = ["System", "Light", "Dark"];
export const DISTANCE_UNITS = ["Kilometers (km)", "Miles (mi)"];
export const TEMP_UNITS = ["Celsius (°C)", "Fahrenheit (°F)"];
export const STEP_CONTENT_VARIANTS = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5 },
  },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
} as const;
