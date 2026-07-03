import React from "react";
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}
export function TextArea({ label, error, icon, className = "", ...props }: TextAreaProps) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-widest text-primary ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-4 text-gray-400 group-focus-within:text-primary transition-colors">
            {icon}
          </div>
        )}
        <textarea
          className={`
            w-full rounded-2xl border bg-white px-4 py-3.5 text-sm outline-none transition-all
            ${icon ? "pl-11" : "pl-4"}
            ${
              error
                ? "border-red-500 focus:ring-1 focus:ring-red-100"
                : "border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/10"
            }
            placeholder:text-gray-300 min-h-[120px] resize-none
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[11px] font-bold text-red-500 ml-1 uppercase tracking-wider">{error}</p>
      )}
    </div>
  );
}
