import React from "react";

/**
 * Y-mark logo — geometric monogram representing growth + charts.
 * Two ascending strokes converge into the stem of the Y like an upward chart.
 */
export function LogoMark({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ys-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0066FF" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#ys-g)" />
      <path
        d="M12 11 L20 22 L28 11"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M20 22 L20 30"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="28" cy="11" r="2" fill="white" />
    </svg>
  );
}

export function LogoLockup({ size = 28, className = "" }) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <div className="leading-none">
        <div className="font-display font-semibold tracking-tight text-[17px]">
          Your<span className="text-[hsl(var(--primary))]">-</span>Statistics
        </div>
      </div>
    </div>
  );
}
