// src/components/faculty/FacultyLayout.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../common/Header";

const navItems = [
  { key: "dashboard", label: "Dashboard", path: "/faculty" },
  { key: "new-submission", label: "New Submission", path: "/new-submission" },
  { key: "drafts", label: "Drafts", path: "/drafts" },
  { key: "submissions", label: "Submission History", path: "/submissions" }, // placeholder
  { key: "events", label: "Upcoming Events", path: "/events" }, // placeholder
];

const FacultyLayout = ({ user, activeKey, children, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Left menu */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="px-6 py-5 border-b border-slate-800">
          <p className="text-xs tracking-wide text-slate-400 uppercase">
            AICTE / NBA
          </p>
          <h1 className="text-lg font-semibold text-slate-50">
            Faculty Portal
          </h1>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.key === activeKey;
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition
                  ${isActive
                    ? "bg-indigo-600/80 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                )}
              </button>
            );
          })}
        </nav>

        {/* bottom help + logout */}
        <div className="px-4 pb-4 pt-2 border-t border-slate-800 space-y-2">
          <button
            type="button"
            onClick={() => alert("Support module will come here later.")}
            className="w-full text-xs text-slate-400 hover:text-slate-100 text-left"
          >
            Need help? Contact support
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="w-full text-sm font-medium text-red-300 hover:text-red-100 border border-red-500/50 rounded-lg py-1.5 hover:bg-red-500/10 transition"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Header already has nice styling in your project */}
        <Header user={user} />

        <main className="flex-1 px-8 py-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
};

export default FacultyLayout;
