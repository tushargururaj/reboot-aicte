// src/components/EmptyState.jsx
import React from "react";

/**
 * Generic empty state component.
 *
 * Props:
 * - title: main text
 * - description: optional secondary text
 * - actionLabel: button label (optional)
 * - onAction: callback when button clicked (optional)
 */
const EmptyState = ({ title, description, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 px-4 text-slate-600">
      <p className="text-sm sm:text-base font-medium mb-1">{title}</p>
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 mb-3">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
