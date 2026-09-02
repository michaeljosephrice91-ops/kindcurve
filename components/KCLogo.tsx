"use client";

import { useId } from "react";

/**
 * Kind Curve logomark — the allocation ring.
 *
 * Four arc segments of deliberately unequal length on one circle: a giving
 * portfolio's split, and a wreath. Unequal is the point — an even ring would
 * read as a progress spinner, and a rising line would read as a stock chart
 * (both were tried and rejected).
 *
 * DRAWING NOTE: round caps extend each segment by half the stroke width at
 * BOTH ends, so a dash sized to the arc you want overlaps its neighbour by
 * (strokeWidth - gap). Dashes are therefore sized as visibleArc - strokeWidth
 * and the offset shifted by strokeWidth / 2. Getting this wrong smears the
 * joins and is invisible until you look closely.
 *
 * Interim mark: a specialist is redrawing this from the brief.
 */

type Variant = "colour" | "white" | "teal";

const R = 34;
const STROKE = 11;
const GAP = 4.5;
const CIRCUMFERENCE = 2 * Math.PI * R;
const WEIGHTS = [60, 40, 28, 20];
const COLOURS = ["#267D91", "#4BB78F", "#E07060", "#5FA8B8"];

/** [dashLength, dashOffset] per segment, with round caps accounted for. */
const SEGMENTS = (() => {
  const usable = CIRCUMFERENCE - GAP * WEIGHTS.length;
  const scale = usable / WEIGHTS.reduce((a, b) => a + b, 0);
  let cursor = 0;
  return WEIGHTS.map((w) => {
    const visible = w * scale;
    const seg = { dash: visible - STROKE, offset: cursor + STROKE / 2 };
    cursor += visible + GAP;
    return seg;
  });
})();

interface KCLogoProps {
  size?: number;
  className?: string;
  variant?: Variant;
}

export function KCLogo({
  size = 60,
  className = "",
  variant = "colour",
}: KCLogoProps) {
  const uid = useId(); // two logos on a page must not share ids

  const strokeFor = (i: number) =>
    variant === "white" ? "#ffffff" : variant === "teal" ? "#267D91" : COLOURS[i];

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
      data-uid={uid}
    >
      {SEGMENTS.map((s, i) => (
        <circle
          key={i}
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke={strokeFor(i)}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${s.dash.toFixed(2)} ${(CIRCUMFERENCE - s.dash).toFixed(2)}`}
          strokeDashoffset={(-s.offset).toFixed(2)}
          transform="rotate(-90 50 50)"
        />
      ))}
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
