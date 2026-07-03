"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { IoCheckmarkOutline, IoShieldCheckmarkOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";
interface PasswordStrengthProps {
  password?: string;
}
export function PasswordStrength({ password = "" }) {
  const requirements = React.useMemo(
    () => [
      { id: "length", label: "At least 8 characters", met: password.length >= 8 },
      { id: "upper", label: "One uppercase letter", met: /[A-Z]/.test(password) },
      { id: "number", label: "One number", met: /[0-9]/.test(password) },
      { id: "special", label: "One special character", met: /[^A-Za-z0-9]/.test(password) },
    ],
    [password]
  );
  const strength = React.useMemo(() => {
    const metCount = requirements.filter((r) => r.met).length;
    if (!password)
      return { score: 0, label: "Enter password", color: "bg-gray-100", text: "text-gray-400" };
    const levels = [
      { label: "Weak", color: "bg-red-500", text: "text-red-500" },
      { label: "Fair", color: "bg-yellow-500", text: "text-yellow-600" },
      { label: "Good", color: "bg-blue-500", text: "text-blue-600" },
      { label: "Strong", color: "bg-green-500", text: "text-green-600" },
    ];
    return { score: metCount, ...(levels[metCount - 1] || levels[0]) };
  }, [requirements, password]);
  return (
    <div className="mt-3 space-y-3">
      <div className="flex justify-between items-center">
        <span className={cn("text-[10px] font-bold uppercase tracking-widest", strength.text)}>
          Security: {strength.label}
        </span>
        {strength.score === 4 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <IoShieldCheckmarkOutline className="text-green-500 text-lg" />
          </motion.div>
        )}
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-500",
              step <= strength.score ? strength.color : "bg-gray-100"
            )}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {requirements.map((req) => (
          <div key={req.id} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full transition-colors",
                req.met ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
              )}
            >
              {req.met ? (
                <IoCheckmarkOutline size={10} />
              ) : (
                <div className="h-1 w-1 rounded-full bg-current" />
              )}
            </div>
            <span
              className={cn("text-[11px]", req.met ? "font-medium text-gray-700" : "text-gray-400")}
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
