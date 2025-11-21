// src/adm_components/AdminHeader.jsx
import React from "react";

const AdminHeader = ({ title, user, onLogout }) => {
  const getInitials = (name = "") => {
    const trimmed = name.trim();
    if (trimmed.length > 0) {
      const parts = trimmed.split(" ");
      if (parts.length === 1) return parts[0][0].toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return "?";
  };

  const initials = getInitials(user?.name);

  // Updated gradient to transition from red-900 to fuchsia-900 for a reddish-violet effect
  return (
    <header className="w-full flex items-center justify-between px-6 sm:px-12 bg-gradient-to-r from-red-900 to-fuchsia-900 shadow-md h-24 fixed top-0 left-0 md:ml-80 md:w-[calc(100%-20rem)] z-10">
      {/* Left: Title */}
      <div className="flex items-center gap-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-wider text-white uppercase">
          {title}
        </h1>
      </div>

      {/* Right: user info + avatar */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-sm sm:text-base text-white/80">
            Logged in as Admin
          </span>
          <span className="text-base sm:text-lg font-medium text-white truncate max-w-[260px]">
            {user?.name || user?.email || "Administrator"}
          </span>
        </div>
        <button
          onClick={() => {
            if (onLogout && window.confirm("Do you want to log out?")) {
              onLogout();
            }
          }}
          className="relative w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:shadow-lg border border-white/60"
        >
          <span className="text-lg font-semibold text-red-900">
            {initials}
          </span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;