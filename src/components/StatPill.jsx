// src/components/StatPill.jsx
import React from "react";

/**
 * Small pill showing a label + value with a colored dot.
 *
 * Props:
 * - label: string
 * - value: string | number
 * - dotColor: Tailwind background color class for the dot (e.g. "bg-indigo-500")
 * - background: Tailwind bg class for pill (e.g. "bg-slate-100")
 */
const StatPill = ({ label, value, dotColor = "bg-indigo-500", background = "bg-slate-100" }) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-[11px] sm:text-xs text-slate-600 ${background}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
};

export default StatPill;
