import * as React from "react";
import { cn } from "@/lib/utils";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  isLoading?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90",
      outline: "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
      ghost: "text-primary hover:underline underline-offset-4 font-semibold",
    };
    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          "flex w-full items-center justify-center rounded-full py-4 font-bold transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed",
          variants[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
export { Button };
