// src/components/faculty/FormLayout.jsx
import React from "react";
import FacultyLayout from "./FacultyLayout";

/**
 * Wrapper around FacultyLayout for form pages.
 * Provides a consistent "Back" button and sets the active sidebar item.
 */
const FormLayout = ({ title, user, onBack, onLogout, children }) => {
  return (
    <FacultyLayout
      title={title}
      user={user}
      onLogout={onLogout}
      activeKey="new-submission" // Forms are usually accessed from New Submission
    >
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-indigo-700 hover:text-indigo-500 transition-colors mb-6 font-medium"
          >
            <span className="text-xl">←</span>
            <span>Back</span>
          </button>
        )}

        {/* Main Content */}
        {children}
      </div>
    </FacultyLayout>
  );
};

export default FormLayout;