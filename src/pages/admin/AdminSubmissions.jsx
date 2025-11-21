// src/pages/admin/AdminSubmissions.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
// FIX: Explicit relative paths to components
import AdminLayout from "../../adm_components/AdminLayout.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import EmptyState from "../../components/EmptyState.jsx";

// Mock data (for now)
const mockSubmissions = [
  { id: 4, faculty: "Ms. R. Gupta", title: "Resource Person at STTP (AI)", code: "6.1.2.1.1", date: "2025-11-10", status: "Rejected" },
];

const AdminSubmissions = ({ user, onLogout }) => {
  const navigate = useNavigate(); // FIX: Define navigate here!
  const [filter, setFilter] = useState("All");

  const filteredSubmissions = useMemo(() => {
    if (filter === "All") return mockSubmissions;
    return mockSubmissions.filter(s => s.status === filter);
  }, [filter]);

  const statusCounts = mockSubmissions.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, { "All": mockSubmissions.length });

  const statusOptions = ["All", "Rejected"];

  return (
    <AdminLayout user={user} onLogout={onLogout} title="Submission Review" activeKey="review-submissions">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* Back Button */}
        <button
          onClick={() => navigate("/admin")}
          className="self-start inline-flex items-center gap-2 text-sm text-slate-600 hover:text-fuchsia-700 transition-colors"
        >
          <span className="text-lg">←</span> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Pending Review Requests</h1>
            <p className="text-base text-slate-700">Review faculty contributions and update their approval status.</p>
          </div>
        </div>

        {/* Filters and Status Count */}
        <div className="flex flex-wrap items-center gap-3 p-4 bg-white/90 rounded-xl border border-red-100 shadow-sm">
          {statusOptions.map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 
                ${filter === status
                  ? "bg-fuchsia-700 text-white shadow-md" // Admin accent color
                  : "bg-gray-100 text-slate-600 hover:bg-gray-200"}`
              }
            >
              {status} ({statusCounts[status] || 0})
            </button>
          ))}
          <span className="ml-auto text-sm text-slate-500">
            Showing {filteredSubmissions.length} of {mockSubmissions.length} total requests.
          </span>
        </div>

        {/* Submissions Table */}
        {filteredSubmissions.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Faculty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Contribution
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-rose-50/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {submission.faculty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {submission.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden sm:table-cell">
                      {submission.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <StatusBadge status={submission.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => alert(`Reviewing submission ${submission.id}`)}
                        className="text-fuchsia-600 hover:text-fuchsia-900 transition"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200">
            <EmptyState
              title={`No ${filter} Submissions`}
              description="Great! All review items are cleared, or adjust your filter."
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSubmissions;