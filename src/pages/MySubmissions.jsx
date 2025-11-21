// src/pages/MySubmissions.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";

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

const MySubmissions = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/submissions/mysubmissions", {
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

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundImage: "linear-gradient(135deg, #f8f2ff 0%, #fff4ea 100%)" }}
    >
      {/* LEFT SIDEBAR */}
      <aside className="hidden md:flex flex-col w-80 fixed top-0 left-0 h-screen bg-gradient-to-b from-indigo-950 to-purple-900 text-white shadow-2xl z-20">
        <div className="px-7 pt-7 pb-5 border-b border-white/10">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60 mb-1">
            AICTE Portal
          </div>
          <div className="text-2xl font-semibold tracking-wide">Faculty Panel</div>
        </div>

        <nav className="flex-1 px-4 pt-5 space-y-1 text-lg">
          <SidebarItem label="Dashboard" icon=">" onClick={() => navigate("/faculty")} />
          <SidebarItem label="My Submissions" icon=">" active onClick={() => navigate("/faculty-submissions")} />
          <SidebarItem label="New Submission" icon=">" onClick={() => navigate("/new-submission")} />
          <SidebarItem label="Drafts" icon=">" onClick={() => navigate("/faculty-drafts")} />
          <SidebarItem label="Profile" icon=">" onClick={() => navigate("/profile")} />
        </nav>

        <div className="px-4 pb-6 pt-4 border-t border-white/10 space-y-2 text-lg">
          <SidebarItem label="Help & Support" icon=">" onClick={() => navigate("/help")} />
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-red-100 hover:bg-red-500/20 hover:text-white font-medium transition-all duration-150"
          >
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col md:ml-80">
        <Header title="My Submissions" user={user} onLogout={onLogout} />

        <main className="flex-1 px-4 sm:px-8 py-6">
          <div className="max-w-6xl mx-auto flex flex-col gap-6">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => navigate("/faculty")}
              className="inline-flex items-center gap-2 text-sm text-indigo-700 hover:text-indigo-500 transition-colors mb-3"
            >
              <span className="text-xl">←</span>
              <span>Back to Dashboard</span>
            </button>

            <h2 className="text-3xl font-semibold text-slate-900">Submission History</h2>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-white/90 rounded-xl border border-indigo-100 shadow-sm">
              {statusOptions.map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 
                    ${filter === status ? "bg-indigo-600 text-white shadow-md" : "bg-gray-100 text-slate-600 hover:bg-gray-200"}`}
                >
                  {status} ({statusCounts[status] || 0})
                </button>
              ))}
              <span className="ml-auto text-sm text-slate-500">Total Submissions: {submissions.length}</span>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contribution Title</th>
                      <th className="px-6 py-3 hidden sm:table-cell text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Section Code</th>
                      <th className="px-6 py-3 hidden lg:table-cell text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-slate-100">
                    {filteredSubmissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-indigo-50/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{submission.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden sm:table-cell">{submission.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden lg:table-cell">{submission.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={submission.status} /></td>

                        {/* FIXED DOWNLOAD BUTTON */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              const filePath = submission.file;
                              const fileName = submission.file_name;

                              console.log("Downloading:", { filePath, fileName });

                              if (!filePath) return;

                              window.location.href =
                                `http://localhost:3000/submissions/file-by-path?p=${encodeURIComponent(filePath)}&name=${encodeURIComponent(fileName)}`;
                            }}
                            className={`transition ${submission.file
                              ? "text-indigo-600 hover:text-indigo-900"
                              : "opacity-50 cursor-not-allowed text-slate-400"
                              }`}
                            disabled={!submission.file}
                          >
                            Download
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
