// src/components/admin/AdminSidebarItem.jsx
import React from "react";

const AdminSidebarItem = ({ label, icon, active = false, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={
        "w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left transition-all duration-150 " +
        (active
          ? "bg-white/20 font-bold shadow-sm border border-white/10 text-lg"
          : "text-white/90 hover:bg-white/10 hover:text-white text-lg")
      }
    >
      {/* Using simple icons for consistency */}
      <span className="text-xl">{icon}</span>
      <span className="text-base sm:text-lg">{label}</span>
    </button>
  );
};

export default AdminSidebarItem;