// src/components/Header.jsx
import React from "react";

const Header = ({ title, user, onLogout, onMenuClick }) => {
  const getInitials = (name = "", email = "") => {
    const trimmed = name.trim();
    if (trimmed.length > 0) {
      const parts = trimmed.split(" ");
      if (parts.length === 1) return parts[0][0].toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (email) return email[0].toUpperCase();
    return "?";
  };

  const initials = getInitials(user?.name, user?.email);

  return (
    <header className="w-full flex items-center justify-between px-4 sm:px-8 bg-gradient-to-r from-indigo-800 to-purple-900 shadow-md h-20">
      {/* Left: optional menu + title */}
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
          >
            <span className="sr-only">Open menu</span>
            <div className="space-y-1">
              <span className="block h-0.5 w-5 bg-white"></span>
              <span className="block h-0.5 w-5 bg-white"></span>
              <span className="block h-0.5 w-5 bg-white"></span>
            </div>
          </button>
        )}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-[0.25em] text-white uppercase">
          {title}
        </h1>
      </div>

      {/* Right: user info + avatar */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs sm:text-sm text-white/80">
            Logged in as
          </span>
          <span className="text-sm sm:text-base font-medium text-white truncate max-w-[220px]">
            {user?.name || user?.email || "Faculty"}
          </span>
        </div>
        <button
          onClick={() => {
            if (onLogout && window.confirm("Do you want to log out?")) {
              onLogout();
            }
          }}
          className="relative w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:shadow-lg border border-white/60"
        >
          <span className="text-sm font-semibold text-indigo-900">
            {initials}
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
