// src/components/admin/AdminHeader.jsx
import React from "react";

const AdminHeader = ({ title, user, onLogout, onMenuClick }) => {
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
    <header className="w-full flex items-center justify-between px-6 sm:px-12 bg-gradient-to-r from-red-900 to-fuchsia-900 shadow-md h-24 fixed top-0 left-0 md:ml-80 md:w-[calc(100%-20rem)] z-10 transition-all duration-300">
      {/* Left: Menu + Title */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Mobile Menu Button */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60 text-white"
          >
            <span className="sr-only">Open menu</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <h1 className="text-xl sm:text-3xl md:text-4xl font-semibold tracking-wider text-white uppercase truncate max-w-[200px] sm:max-w-none">
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
          className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:shadow-lg border border-white/60 flex-shrink-0"
        >
          <span className="text-base sm:text-lg font-semibold text-red-900">
            {initials}
          </span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;