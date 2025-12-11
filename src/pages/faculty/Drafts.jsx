// src/pages/faculty/Drafts.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import {
  getDraftsForUser,
  deleteDraft,
} from "../../utils/submissionsClient";
import FacultySidebar from "../../components/faculty/FacultySidebar";
import {
  getDefaultFacultyNavItems,
  getProfileNavItem,
  getHelpNavItem,
} from "../../utils/facultyNav";

const FacultyDrafts = ({ user, onBack, onLogout }) => {
  const navigate = useNavigate();

  const userId = user?.id || user?.email || "anonymous";

  const drafts = useMemo(() => getDraftsForUser(userId), [userId]);
  const navItems = getDefaultFacultyNavItems(navigate, "drafts");
  const profileItem = getProfileNavItem(navigate, false);
  const helpItem = getHelpNavItem(navigate);

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
      <FacultySidebar
        navItems={navItems}
        profileItem={profileItem}
        helpItem={helpItem}
        onLogout={onLogout}
      />

      {/* RIGHT: header + main */}
      <div className="flex-1 flex flex-col md:ml-80">
        <Header title="Drafts" user={user} onLogout={onLogout} />

        <main className="flex-1 px-4 sm:px-8 py-6">
          <div className="max-w-5xl mx-auto flex flex-col gap-4">
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center gap-3 text-base text-indigo-700 hover:text-indigo-500 transition-colors font-medium"
                >
                  <span className="text-2xl">←</span>
                  <span>Back to New Submission</span>
                </button>
                <h2 className="mt-3 text-3xl sm:text-4xl font-semibold text-slate-900">
                  Saved Drafts
                </h2>
                <p className="mt-2 text-base text-slate-700">
                  Resume or delete your in-progress submissions.
                </p>
              </div>
              <div className="text-base text-slate-600 font-semibold">
                Total drafts:{" "}
                <span className="font-semibold text-indigo-700">
                  {drafts.length}
                </span>
              </div>
            </div>

            {/* Drafts list */}
            <div className="mt-2 bg-white/95 rounded-2xl border border-slate-200 shadow-md">
              {drafts.length === 0 ? (
                <div className="px-5 py-8 text-center text-base text-slate-500">
                  You don’t have any drafts yet. Start a new submission and
                  click “Save as Draft”.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {drafts.map((draft) => (
                    <li
                      key={draft.id}
                      className="px-4 sm:px-5 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <div>
                        <p className="text-base sm:text-lg font-semibold text-slate-900">
                          {draft.title}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          Section {draft.sectionCode} &middot; Last updated:{" "}
                          {new Date(draft.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-3 justify-start sm:justify-end">
                        <button
                          type="button"
                          onClick={() => handleResume(draft)}
                          className="px-4 py-2 rounded-lg text-sm sm:text-base font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md"
                        >
                          Resume
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(draft.id)}
                          className="px-4 py-2 rounded-lg text-sm sm:text-base font-semibold border border-red-200 text-red-600 bg-white hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="text-sm sm:text-base text-slate-500 text-center mt-3">
              Drafts are stored locally in this browser for now. Later, these
              can be synced to the backend using your cookie-based session.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FacultyDrafts;
