// src/pages/admin/AdminSimplePage.jsx
import React from "react";
// FIX: Corrected import paths
import AdminLayout from "../../adm_components/AdminLayout.jsx";
import EmptyState from "../../components/EmptyState.jsx"; // Reuse standard EmptyState

/**
 * A reusable component for placeholder admin pages (Faculty/Events/System).
 */
const AdminSimplePage = ({ user, onLogout, title, message, activeKey }) => {
  return (
    <AdminLayout user={user} onLogout={onLogout} title={title} activeKey={activeKey}>
      <div className="mt-10 max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-red-100">
        <EmptyState
            title={title}
            description={message}
            actionLabel="Back to Dashboard"
            onAction={() => window.location.href = '/admin'}
        />
        <p className="mt-6 text-sm text-center text-slate-500">
          This section is currently under development.
        </p>
      </div>
    </AdminLayout>
  );
};

export default AdminSimplePage;