// src/pages/FacultyDrafts.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  getDraftsForUser,
  deleteDraft,
} from "../utils/submissionsClient";

const FacultyDrafts = ({ user, onBack, onLogout }) => {
  const navigate = useNavigate();

  const userId = user?.id || user?.email || "anonymous";

  const drafts = useMemo(() => getDraftsForUser(userId), [userId]);

  const handleDelete = (id) => {
    if (window.confirm("Delete this draft? This cannot be undone.")) {
      deleteDraft(id);
      // Quick way: just reload the page's data
      window.location.reload();
    }
  };

  const handleResume = (draft) => {
    // FIX: Navigate using the dynamic section code and draftId query parameter
    navigate(`/new-submission/${draft.sectionCode}?draftId=${encodeURIComponent(draft.id)}`);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        backgroundImage: "linear-gradient(135deg, #f8f2ff 0%, #fff4ea 100%)",
      }}
    >
      {/* LEFT: Sidebar (reuse same pattern, highlight Drafts) */}
      <aside className="hidden md:flex flex-col w-72 bg-gradient-to-b from-indigo-950 to-purple-900 text-white shadow-2xl">
        <div className="px-7 pt-7 pb-5 border-b border-white/10">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60 mb-1">
            AICTE Portal
          </div>
          <div className="text-xl font-semibold tracking-wide">
            Faculty Panel
          </div>
        </div>

        <nav className="flex-1 px-4 pt-5 space-y-1 text-base">
          <SidebarItem
            label="Dashboard"
            icon="📊"
            onClick={() => navigate("/faculty")}
          />
          <SidebarItem
            label="My Submissions"
            icon="📄"
            onClick={() => navigate("/faculty-submissions")}
          />
          <SidebarItem
            label="New Submission"
            icon="➕"
            onClick={() => navigate("/new-submission")}
          />
          <SidebarItem
            label="Drafts"
            icon="📝"
            active
            onClick={() => navigate("/faculty-drafts")}
          />
          <SidebarItem
            label="AI Upload"
            icon="🤖"
            onClick={() => navigate("/ai-upload")}
          />
          <SidebarItem
            label="Upcoming Events"
            icon="📅"
            onClick={() => navigate("/events")}
          />
          <SidebarItem
            label="Profile"
            icon="👤"
            onClick={() => navigate("/profile")}
          />
        </nav>

        <div className="px-4 pb-6 pt-4 border-t border-white/10 space-y-2 text-base">
          <SidebarItem
            label="Help & Support"
            icon="❓"
            onClick={() => navigate("/help")}
          />
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-red-100 hover:bg-red-500/20 hover:text-white font-medium transition-all duration-150"
          >
            <span className="text-lg">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* RIGHT: header + main */}
      <div className="flex-1 flex flex-col">
        <Header title="Drafts" user={user} onLogout={onLogout} />

        <main className="flex-1 px-4 sm:px-8 py-6">
          <div className="max-w-5xl mx-auto flex flex-col gap-4">
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm text-indigo-700 hover:text-indigo-500 transition-colors"
                >
                  <span className="text-base">←</span>
                  <span>Back to New Submission</span>
                </button>
                <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-900">
                  Saved Drafts
                </h2>
                <p className="mt-1 text-sm text-slate-700">
                  Resume or delete your in-progress submissions.
                </p>
              </div>
              <div className="text-sm text-slate-600">
                Total drafts:{" "}
                <span className="font-semibold text-indigo-700">
                  {drafts.length}
                </span>
              </div>
            </div>

            {/* Drafts list */}
            <div className="mt-2 bg-white/95 rounded-2xl border border-slate-200 shadow-sm">
              {drafts.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-slate-500">
                  You don’t have any drafts yet. Start a new submission and
                  click “Save as Draft”.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {drafts.map((draft) => (
                    <li
                      key={draft.id}
                      className="px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                    >
                      <div>
                        <p className="text-sm sm:text-base font-medium text-slate-900">
                          {draft.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Section {draft.sectionCode} &middot; Last updated:{" "}
                          {new Date(draft.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2 justify-start sm:justify-end">
                        <button
                          type="button"
                          onClick={() => handleResume(draft)}
                          className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
                        >
                          Resume
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(draft.id)}
                          className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium border border-red-200 text-red-600 bg-white hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-500 text-center mt-3">
              Drafts are stored locally in this browser for now. Later, these
              can be synced to the backend using your cookie-based session.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ label, icon, active = false, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 " +
        (active
          ? "bg-white/18 font-semibold shadow-sm border border-white/10"
          : "text-white/85 hover:bg-white/10 hover:text-white")
      }
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm sm:text-base">{label}</span>
    </button>
  );
};

export default FacultyDrafts;
