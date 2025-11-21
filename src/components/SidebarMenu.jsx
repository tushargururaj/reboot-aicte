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
      <aside className="fixed top-0 left-0 h-full w-72 bg-indigo-950 text-white z-50 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <span className="font-semibold tracking-wide text-base uppercase">Menu</span>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-lg"
          >
            ✕
          </button>
        </div>
        <nav className="px-5 py-5 space-y-2 text-base">
          {items.map((item) => (
            <button
              key={item.key}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/10 font-medium tracking-wide"
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
              className="mt-6 w-full text-left px-4 py-3 rounded-lg bg-red-500/80 hover:bg-red-400 text-base font-semibold tracking-wide"
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
