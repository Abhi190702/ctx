import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "border-mint/50 bg-mint px-4 py-2 text-ink hover:bg-mint/90",
        variant === "secondary" && "border-line bg-white/5 px-4 py-2 text-slate-100 hover:bg-white/10",
        variant === "ghost" && "border-transparent bg-transparent px-3 py-2 text-slate-300 hover:bg-white/10 hover:text-white",
        variant === "danger" && "border-rose/50 bg-rose/15 px-4 py-2 text-rose hover:bg-rose/20",
        size === "sm" && "min-h-9 px-3 text-sm",
        size === "md" && "min-h-10 text-sm",
        size === "icon" && "h-10 w-10 p-0",
        className,
      )}
      {...props}
    />
  );
}
