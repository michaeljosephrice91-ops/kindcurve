"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function BackButton({
  href,
  onClick,
  label = "Back",
}: {
  href?: string;
  onClick?: () => void;
  label?: string;
}) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) onClick();
    else if (href) router.push(href);
    else router.back();
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors py-4 text-[15px]"
    >
      <ArrowLeft size={18} />
      {label}
    </button>
  );
}

export function TealButton({
  children,
  onClick,
  disabled = false,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full py-4 px-6 rounded-full font-semibold text-base transition-all",
        disabled
          ? "bg-gray-300 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
          : "bg-gradient-to-r from-kc-teal to-kc-cyan text-white shadow-[0_4px_16px_rgba(38,125,145,0.3)] hover:shadow-[0_6px_24px_rgba(38,125,145,0.4)]",
        className
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full py-3.5 rounded-full border border-[#e8e4da] dark:border-kc-border bg-white dark:bg-kc-card text-gray-600 dark:text-gray-300 text-[15px] transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 mt-2.5"
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-kc-card rounded-3xl border border-[#e8e4da] dark:border-kc-border shadow-sm p-6 transition-colors",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-kc-cream dark:bg-kc-dark transition-colors">
      <div className="max-w-[520px] mx-auto px-6 pb-10">{children}</div>
    </div>
  );
}
