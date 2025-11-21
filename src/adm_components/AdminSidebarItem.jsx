// src/adm_components/AdminSidebarItem.jsx
import React from "react";

const AdminSidebarItem = ({ label, icon, active = false, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 " +
        (active
          ? "bg-white/15 font-semibold shadow-sm border border-white/10"
          : "text-white/85 hover:bg-white/10 hover:text-white")
      }
    >
      {/* Using simple icons for consistency */}
      <span className="text-lg">{icon}</span>
      <span className="text-sm sm:text-base">{label}</span>
    </button>
  );
};

export default AdminSidebarItem;