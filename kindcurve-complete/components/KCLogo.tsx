"use client";

/**
 * Kind Curve Logo — Nano Banana brand design.
 *
 * Three flowing curves form the K:
 * - Coral sweep (upper, left to right)
 * - Green sweep (upper, offset)
 * - Teal stem (vertical with upward diagonal)
 * - Cream arrowhead at the tip (growth/momentum)
 *
 * The three coloured strokes represent the compounding layers:
 * teal (financial), coral (impact), green (behavioural).
 */

interface KCLogoProps {
  size?: number;
  className?: string;
  variant?: "colour" | "white" | "teal";
}

export function KCLogo({
  size = 60,
  className = "",
  variant = "colour",
}: KCLogoProps) {
  const colours = {
    colour: {
      coral: "#E07060",
      green: "#4BB78F",
      teal: "#267D91",
      arrow: "#FFF9EB",
    },
    white: {
      coral: "#ffffffdd",
      green: "#ffffffcc",
      teal: "#ffffff",
      arrow: "#ffffff44",
    },
    teal: {
      coral: "#267D91aa",
      green: "#267D91cc",
      teal: "#267D91",
      arrow: "#267D9144",
    },
  };

  const c = colours[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Coral sweep — impact layer */}
      <path
        d="M40 160C80 160 100 120 120 80C140 40 160 20 180 20"
        stroke={c.coral}
        strokeWidth="24"
        strokeLinecap="round"
      />
      {/* Green sweep — behavioural layer */}
      <path
        d="M60 160C100 160 120 120 140 80C160 40 180 20 200 20"
        stroke={c.green}
        strokeWidth="24"
        strokeLinecap="round"
      />
      {/* Teal stem — financial layer */}
      <path
        d="M80 180V100C80 60 100 40 140 20"
        stroke={c.teal}
        strokeWidth="24"
        strokeLinecap="round"
      />
      {/* Arrowhead — forward momentum */}
      <path
        d="M130 30L160 10L140 40"
        stroke={c.arrow}
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Full logo lockup — logomark + "Kind Curve" wordmark.
 * For nav bars and headers.
 */
export function KCLogoLockup({
  height = 36,
  className = "",
  variant = "colour",
}: {
  height?: number;
  className?: string;
  variant?: "colour" | "white" | "teal";
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <KCLogo size={height} variant={variant} />
      <div className="flex flex-col leading-none">
        <span
          className="font-bold tracking-tight text-gray-900 dark:text-gray-100"
          style={{ fontSize: height * 0.4 }}
        >
          Kind
        </span>
        <span
          className="font-bold tracking-tight text-gray-900 dark:text-gray-100"
          style={{ fontSize: height * 0.4 }}
        >
          Curve
        </span>
      </div>
    </div>
  );
}
