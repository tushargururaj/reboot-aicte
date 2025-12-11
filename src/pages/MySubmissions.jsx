// src/pages/MySubmissions.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import FacultySidebar from "../components/FacultySidebar";
import {
  getDefaultFacultyNavItems,
  getProfileNavItem,
  getHelpNavItem,
} from "../utils/facultyNav";

const MySubmissions = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navItems = getDefaultFacultyNavItems(navigate, "my-submissions");
  const profileItem = getProfileNavItem(navigate, false);
  const helpItem = getHelpNavItem(navigate);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/api/submissions/mysubmissions", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) throw new Error("Failed to fetch submissions");
        const data = await response.json();
        setSubmissions(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user]);

  const filteredSubmissions = useMemo(() => {
    if (filter === "All") return submissions;
    return submissions.filter(s => s.status === filter);
  }, [filter, submissions]);

  const statusCounts = useMemo(() => {
    return submissions.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, { All: submissions.length });
  }, [submissions]);

  const statusOptions = ["All", "Rejected", "Submitted"];

  const handleDelete = async (code, id) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) return;

    try {
      const response = await fetch(`http://localhost:3000/api/submissions/${code}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting submission");
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundImage: "linear-gradient(135deg, #f8f2ff 0%, #fff4ea 100%)" }}
    >
      <FacultySidebar
        navItems={navItems}
        profileItem={profileItem}
        helpItem={helpItem}
        onLogout={onLogout}
      />

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col md:ml-80">
        <Header title="My Submissions" user={user} onLogout={onLogout} />

        <main className="flex-1 px-4 sm:px-8 py-6">
          <div className="max-w-6xl mx-auto flex flex-col gap-6">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => navigate("/faculty")}
              className="inline-flex items-center gap-3 text-base text-indigo-700 hover:text-indigo-500 transition-colors mb-4 font-medium"
            >
              <span className="text-2xl">←</span>
              <span>Back to Dashboard</span>
            </button>

            <h2 className="text-4xl font-semibold text-slate-900">Submission History</h2>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 p-5 bg-white/90 rounded-2xl border border-indigo-100 shadow-md">
              {statusOptions.map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-5 py-2.5 rounded-full text-base font-semibold transition-all duration-200 
                    ${filter === status ? "bg-indigo-600 text-white shadow-md" : "bg-gray-100 text-slate-600 hover:bg-gray-200"}`}
                >
                  {status} ({statusCounts[status] || 0})
                </button>
              ))}
              <span className="ml-auto text-base text-slate-500 font-medium">Total Submissions: {submissions.length}</span>
            </div>

            {/* TABLE */}
            {loading ? (
              <div className="text-center py-10 text-slate-500">Loading submissions...</div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">Error: {error}</div>
            ) : filteredSubmissions.length > 0 ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider w-16">S.No</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider max-w-xs">Contribution Title</th>
                      <th className="px-6 py-4 hidden sm:table-cell text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 hidden lg:table-cell text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Date of Conduct</th>
                      <th className="px-6 py-4 hidden md:table-cell text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Year/Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-slate-100">
                    {filteredSubmissions.map((submission, index) => (
                      <tr key={submission.id} className="hover:bg-indigo-50/50 transition">
                        {/* Serial Number */}
                        <td className="px-6 py-5 whitespace-nowrap text-base font-medium text-slate-500">{index + 1}</td>

                        {/* Title with wrapping */}
                        <td className="px-6 py-5 text-base font-semibold text-slate-900 max-w-xs break-words whitespace-normal">
                          {submission.title}
                        </td>

                        {/* Section Code / Type */}
                        <td className="px-6 py-5 whitespace-nowrap text-base text-slate-500 hidden sm:table-cell">{submission.code}</td>

                        {/* Date of Conduct */}
                        <td className="px-6 py-5 whitespace-nowrap text-base text-slate-500 hidden lg:table-cell">
                          {submission.date !== 'N/A' ? submission.date : '-'}
                        </td>

                        {/* Submission Year/Date (Proxy) */}
                        <td className="px-6 py-5 whitespace-nowrap text-base text-slate-500 hidden md:table-cell">
                          {submission.academic_year || '-'}
                        </td>

                        <td className="px-6 py-5 whitespace-nowrap text-base"><StatusBadge status={submission.status} /></td>

                        {/* Actions */}
                        <td className="px-6 py-5 whitespace-nowrap text-right text-base font-semibold">
                          <button
                            onClick={() => {
                              const filePath = submission.file;
                              const fileName = submission.file_name;

                              console.log("Downloading:", { filePath, fileName });

                              if (!filePath) return;

                              window.location.href =
                                `http://localhost:3000/api/submissions/file-by-path?p=${encodeURIComponent(filePath)}&name=${encodeURIComponent(fileName)}`;
                            }}
                            className={`transition ${submission.file
                              ? "text-indigo-600 hover:text-indigo-900"
                              : "opacity-50 cursor-not-allowed text-slate-400"
                              }`}
                            disabled={!submission.file}
                          >
                            Download
                          </button>
                          <button
                            onClick={() => handleDelete(submission.code, submission.id)}
                            className="ml-6 text-red-500 hover:text-red-700 transition"
                          >
                            Delete
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
                  title={`No ${filter} Submissions Found`}
                  description="Try clearing your filter or start a new submission."
                  actionLabel="Start New Submission"
                  onAction={() => navigate("/new-submission")}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MySubmissions;
