// src/components/Toast.jsx
import React, { useEffect } from "react";

export default function Toast({ open, level = "info", text = "", onClose, duration = 3800 }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;
  const bg = level === "error" ? "bg-red-600" : level === "success" ? "bg-green-600" : "bg-slate-800";
  return (
    <div className={`fixed right-6 bottom-6 z-60 ${bg} text-white px-4 py-2 rounded shadow-lg`}>
      <div className="flex items-center gap-3">
        <div className="font-semibold">{level.toUpperCase()}</div>
        <div className="text-sm">{text}</div>
        <button className="ml-2 opacity-80" onClick={onClose}>✕</button>
      </div>
    </div>
  );
}
