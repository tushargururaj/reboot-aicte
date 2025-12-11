// src/pages/faculty/SimplePage.jsx
import React from "react";
import FacultyLayout from "../../components/faculty/FacultyLayout"; // Faculty layout component
import { useNavigate } from "react-router-dom";

/**
 * A reusable component for placeholder/simple faculty pages.
 * It ensures a consistent layout (header, sidebar) is used.
 */
const SimpleFacultyPage = ({ user, title, message, onLogout }) => {
  const navigate = useNavigate();

  return (
    // Wrap content in the main Faculty Layout component
    <FacultyLayout
      user={user}
      activeKey={title.toLowerCase().replace(/\s/g, "-")} // Dynamic active key for sidebar
      onLogout={onLogout}
    >
      {/* Page Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-xl bg-white/95 rounded-2xl shadow-md border border-indigo-100 px-6 py-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">{title}</h1>
          <p className="text-sm sm:text-base text-slate-600">{message}</p>
          <p className="mt-4 text-xs text-slate-400">
            (This section will be fully implemented later.)
          </p>
          <button
            onClick={() => navigate("/faculty")}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </FacultyLayout>
  );
};

export default SimpleFacultyPage;