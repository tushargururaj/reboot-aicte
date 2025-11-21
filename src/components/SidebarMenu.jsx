// src/components/SidebarMenu.jsx
import React from "react";

const SidebarMenu = ({ isOpen, onClose, onLogout, items = [] }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      {/* Drawer */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-indigo-950 text-white z-50 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <span className="font-semibold tracking-wide text-sm">Menu</span>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10"
          >
            ✕
          </button>
        </div>
        <nav className="px-4 py-4 space-y-1 text-sm">
          {items.map((item) => (
            <button
              key={item.key}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10"
              onClick={() => {
                if (item.onClick) item.onClick();
                onClose();
              }}
            >
              {item.label}
            </button>
          ))}

          {onLogout && (
            <button
              className="mt-4 w-full text-left px-3 py-2 rounded-md bg-red-500/80 hover:bg-red-400 text-sm font-medium"
              onClick={() => {
                onClose();
                onLogout();
              }}
            >
              Logout
            </button>
          )}
        </nav>
      </aside>
    </>
  );
};

export default SidebarMenu;
