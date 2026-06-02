import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "icon";
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "border-mint bg-mint px-4 py-2 text-foreground shadow-sm hover:bg-mint-dark",
        variant === "secondary" && "border-line bg-panel px-4 py-2 text-foreground shadow-sm hover:border-strongline hover:bg-ink",
        variant === "outline" && "border-line bg-transparent px-4 py-2 text-foreground hover:border-mint hover:bg-mint-soft",
        variant === "ghost" && "border-transparent bg-transparent px-3 py-2 text-muted-foreground hover:bg-ink hover:text-foreground",
        variant === "danger" && "border-rose/30 bg-rose/10 px-4 py-2 text-rose hover:bg-rose/15",
        size === "sm" && "min-h-9 px-3 text-sm",
        size === "md" && "min-h-10 text-sm",
        size === "icon" && "h-10 w-10 p-0",
        className,
      )}
      {...props}
    />
  );
}
