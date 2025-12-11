// src/components/common/StatusBadge.jsx
import React from "react";

const getStatusClasses = (status) => {
  switch (status) {
    case "Rejected":
      return "bg-red-100 text-red-700 border border-red-200";
    case "Draft":
    default:
      return "bg-gray-100 text-gray-700 border border-gray-200";
  }
};

const StatusBadge = ({ status }) => {
  return (
    <span
      className={
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold " +
        getStatusClasses(status)
      }
    >
      {status}
    </span>
  );
};

export default StatusBadge;
