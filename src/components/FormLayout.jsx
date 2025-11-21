// src/components/FormLayout.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Fixed sidebar layout: sidebar is fixed, main area scrolls.
 * NOTE: This version is specifically for the form pages.
 */
const FormLayout = ({ title, user, onBack, onLogout, children }) => {
  const navigate = useNavigate();
  
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
    <div className="min-h-screen flex bg-[linear-gradient(135deg,#f8f2ff_0%,#fff4ea_100%)]">
      {/* Fixed Sidebar */}
      <aside
        className="hidden md:flex flex-col w-72 bg-gradient-to-b from-indigo-950 to-purple-900 text-white shadow-2xl
                   fixed left-0 top-0 bottom-0 z-40"
      >
        <div className="px-7 pt-7 pb-5 border-b border-white/10">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60 mb-1">
            AICTE Portal
          </div>
          <div className="text-xl font-semibold tracking-wide">Faculty Panel</div>
        </div>

        <nav className="flex-1 px-4 pt-5 space-y-1 text-base overflow-auto">
          <SidebarItem label="Dashboard" icon="📊" onClick={() => navigate("/faculty")} />
          <SidebarItem label="My Submissions" icon="📄" onClick={() => navigate("/faculty-submissions")} />
          <SidebarItem label="New Submission" icon="➕" onClick={() => navigate("/new-submission")} active={title.includes("Submission") || title.includes("FDP") || title.includes("MOOCs")} />
          <SidebarItem label="Drafts" icon="📝" onClick={() => navigate("/faculty-drafts")} />
          <SidebarItem label="AI Upload" icon="🤖" onClick={() => navigate("/ai-upload")} />
          <SidebarItem label="Upcoming Events" icon="📅" onClick={() => navigate("/events")} />
          <SidebarItem label="Profile" icon="👤" onClick={() => navigate("/profile")} />
        </nav>

        <div className="px-4 pb-6 pt-4 border-t border-white/10 space-y-2 text-base">
          <SidebarItem label="Help & Support" icon="❓" onClick={() => navigate("/help")} />
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-red-100 hover:bg-red-500/20 hover:text-white font-medium transition-all duration-150"
          >
            <span className="text-lg">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content area — push it right by sidebar width on md+ */}
      <div className="flex-1 flex flex-col md:ml-72 w-full">
        
        {/* FIXED: Header with gradient and dark text/icons */}
        <div className="sticky top-0 z-30 w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-800 to-purple-900 shadow-md h-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack} 
              className="text-white hover:text-indigo-200 transition-colors text-lg font-medium"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-semibold text-white tracking-wide">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-white/80 hidden sm:block">
              Welcome,&nbsp;<span className="font-medium text-white">{user?.name || user?.email || "User"}</span>
            </div>
            <button 
              onClick={() => { if (onLogout && window.confirm("Do you want to log out?")) onLogout(); }} 
              className="relative w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:shadow-lg border border-white/60"
            >
              <span className="text-sm font-semibold text-indigo-900">
                {(user?.name || "U").slice(0, 1).toUpperCase()}
              </span>
            </button>
          </div>
        </div>

        {/* Scrollable main area */}
        <main className="flex-1 overflow-auto px-6 py-6">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ label, icon, active = false, onClick }) => (
  <button
    onClick={onClick}
    className={
      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 " +
      (active ? "bg-white/18 font-semibold" : "text-white/85 hover:bg-white/10 hover:text-white")
    }
  >
    <span className="text-lg">{icon}</span>
    <span className="text-sm sm:text-base">{label}</span>
  </button>
);

export default FormLayout;