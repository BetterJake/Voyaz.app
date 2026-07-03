"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  showToggle?: boolean;
}
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, showToggle, ...props }, ref) => {
    const [show, setShow] = React.useState(false);
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-bold uppercase tracking-widest text-primary">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={showToggle ? (show ? "text" : "password") : type}
            className={cn(
              "w-full rounded-xl border border-gray-200 px-4 py-3.5 text-sm outline-none transition-all",
              "focus:ring-2 focus:ring-primary/20 focus:border-primary",
              "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-100",
              icon && "pl-11",
              showToggle && "pr-11",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />
          {showToggle && (
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
            >
              {show ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
            </button>
          )}
        </div>
        {error && <p className="text-[11px] font-medium text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
export { Input };
