"use client";

import { useId } from "react";

/**
 * Kind Curve logomark.
 *
 * The mark IS the argument: one steady curve bending upward away from the
 * flat line of the same money given in bursts. The widening gap between the
 * two is the whole product in one shape — which is why it reads as a mark
 * rather than as decoration, and why it still means something at 16px.
 *
 * Teal → green along the curve (steady giving, compounding); the coral point
 * is where it ends up.
 */

type Variant = "colour" | "white" | "teal";

interface KCLogoProps {
  size?: number;
  className?: string;
  variant?: Variant;
}

const CURVE = "M14 80 C40 79 58 60 86 18";
const BASELINE = "M14 80 H86";

export function KCLogo({
  size = 60,
  className = "",
  variant = "colour",
}: KCLogoProps) {
  // Unique per instance: two logos on one page must not share a gradient id.
  const gradientId = useId();

  const palette = {
    colour: {
      from: "#267D91",
      to: "#4BB78F",
      baseline: "#CFC2AC",
      point: "#E07060",
    },
    white: {
      from: "#ffffff",
      to: "#ffffff",
      baseline: "#ffffff59",
      point: "#ffffff",
    },
    teal: {
      from: "#267D91",
      to: "#267D91",
      baseline: "#267D9140",
      point: "#267D91",
    },
  }[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      role="img"
      aria-label="Kind Curve"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="14"
          y1="80"
          x2="86"
          y2="18"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={palette.from} />
          <stop offset="1" stopColor={palette.to} />
        </linearGradient>
      </defs>

      {/* The same money, given in bursts. */}
      <path
        d={BASELINE}
        stroke={palette.baseline}
        strokeWidth="6.5"
        strokeLinecap="round"
      />

      {/* Given steadily. */}
      <path
        d={CURVE}
        stroke={`url(#${gradientId})`}
        strokeWidth="10.5"
        strokeLinecap="round"
      />

      <circle cx="86" cy="18" r="6" fill={palette.point} />
    </svg>
  );
}

/**
 * Logomark plus wordmark, set on one line. For headers and nav.
 */
export function KCLogoLockup({
  height = 36,
  className = "",
  variant = "colour",
}: {
  height?: number;
  className?: string;
  variant?: Variant;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <KCLogo size={height} variant={variant} />
      <span
        className="font-semibold tracking-tight text-gray-900 dark:text-gray-100 whitespace-nowrap"
        style={{ fontSize: height * 0.46 }}
      >
        Kind Curve
      </span>
    </div>
  );
}
