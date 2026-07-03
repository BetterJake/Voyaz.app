"use client";
import React from "react";
import { Compass, MoreHorizontal, Sparkles } from "lucide-react";
interface PlanProgressBarProps {
  step: number;
  setStep: (step: number) => void;
}
const PlanProgressBar: React.FC<PlanProgressBarProps> = ({ step, setStep }) => {
  const steps = [
    { num: 1, label: "Places", icon: Compass },
    { num: 2, label: "Details", icon: MoreHorizontal },
    { num: 3, label: "Your Plan", icon: Sparkles },
  ];
  return (
    <div className="w-full max-w-2xl mx-auto mb-10 mt-6 px-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full z-0 transition-all duration-500 ease-out"
          style={{ width: `${(step - 1) * 50}%` }}
        ></div>
        {steps.map(({ num, label, icon: Icon }) => (
          <div
            key={num}
            className="relative z-10 flex flex-col items-center cursor-pointer"
            onClick={() => num < step && setStep(num)}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${
                step >= num
                  ? "bg-blue-500 text-white shadow-blue-500/30 scale-110"
                  : "bg-white text-gray-400 border border-gray-100"
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span
              className={`absolute -bottom-6 text-[10px] uppercase tracking-wider font-bold whitespace-nowrap transition-colors ${
                step >= num ? "text-blue-500" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default PlanProgressBar;
