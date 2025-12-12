import React from "react";

const SidebarButton = ({ label, onClick, active = false, disabled = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={
      "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-150 text-base font-medium tracking-wide " +
      (disabled
        ? "text-white/40 cursor-not-allowed"
        : active
          ? "bg-white/18 font-semibold shadow-sm border border-white/10 text-white"
          : "text-white/85 hover:bg-white/10 hover:text-white")
    }
  >
    <span className="text-lg font-bold">›</span>
    <span className="text-base sm:text-lg">{label}</span>
  </button>
);

const FacultySidebar = ({
  navItems = [],
  profileItem,
  helpItem,
  onLogout,
  className = "",
  isOpen = false,
  onClose,
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen bg-gradient-to-b from-indigo-950 to-purple-900 text-white shadow-2xl z-50 
          transition-transform duration-300 ease-in-out w-80 flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${className}
        `}
      >
        <div className="px-7 pt-7 pb-5 border-b border-white/10 flex justify-between items-center">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60 mb-1">
              AICTE Portal
            </div>
            <div className="text-2xl font-semibold tracking-wide">Faculty Panel</div>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-4 pt-5 space-y-1 text-lg overflow-auto">
          {navItems.map((item) => (
            <SidebarButton
              key={item.key}
              label={item.label}
              onClick={() => {
                if (item.onClick) item.onClick();
                if (onClose) onClose(); // Close sidebar on mobile nav
              }}
              active={item.active}
              disabled={item.disabled}
            />
          ))}
        </nav>

        <div className="px-4 pb-6 pt-4 border-t border-white/10 space-y-2 text-lg">
          {profileItem && (
            <SidebarButton
              label={profileItem.label}
              onClick={() => {
                if (profileItem.onClick) profileItem.onClick();
                if (onClose) onClose();
              }}
              active={profileItem.active}
              disabled={profileItem.disabled}
            />
          )}
          {helpItem && (
            <SidebarButton
              label={helpItem.label}
              onClick={() => {
                if (helpItem.onClick) helpItem.onClick();
                if (onClose) onClose();
              }}
              active={helpItem.active}
              disabled={helpItem.disabled}
            />
          )}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-red-100 hover:bg-red-500/20 hover:text-white font-semibold tracking-wide transition-all duration-150"
            >
              <span>Logout</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default FacultySidebar;
