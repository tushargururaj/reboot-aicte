// src/pages/admin/Dashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

const AdminDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const cards = [
    {
      key: "submissions",
      title: "Submissions",
      description: "Browse and review faculty contributions by category.",
      onClick: () => navigate("/admin/submissions"),
      accent: "border-fuchsia-400 hover:border-fuchsia-600",
    },
    {
      key: "magic-links",
      title: "Magic Links",
      description: "Generate secure, one-time submission links for faculty.",
      onClick: () => navigate("/admin/magic-links"),
      accent: "border-indigo-400 hover:border-indigo-600",
    },
    {
      key: "faculty-list",
      title: "Faculty List",
      description: "Manage faculty directory and view individual portfolios.",
      onClick: () => navigate("/admin/faculty"),
      accent: "border-red-400 hover:border-red-600",
    },
    {
      key: "reports",
      title: "Reports & Analytics",
      description: "System-wide insights and data export. (Coming Soon)",
      onClick: () => navigate("/admin/reports"),
      accent: "border-fuchsia-400 hover:border-fuchsia-600",
    },
    {
      key: "events",
      title: "Manage Events",
      description: "Schedule FDPs and internal deadlines. (Coming Soon)",
      onClick: () => navigate("/admin/events"),
      accent: "border-red-400 hover:border-red-600",
    },
  ];

  return (
    <AdminLayout user={user} onLogout={onLogout} title="Admin Dashboard" activeKey="dashboard">
      <div className="flex flex-col gap-8">
        {/* Welcome Section */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900">
              WELCOME,{" "}
              <span className="uppercase text-fuchsia-700">
                {user?.name || user?.email || "Administrator"}
              </span>
            </h2>
            <p className="mt-1 text-base text-slate-700">
              Select an option below to manage the portal.
            </p>
          </div>
        </section>

        {/* Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cards.map((card) => (
            <button
              key={card.key}
              onClick={card.onClick}
              className={`group relative text-left bg-white/95 rounded-2xl border ${card.accent} shadow-sm hover:shadow-lg px-6 py-8 transition-all duration-200 hover:-translate-y-[3px] focus:outline-none focus:ring-2 focus:ring-fuchsia-300 min-h-[200px]`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                    {card.title}
                  </h3>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
              {/* subtle bottom accent on hover */}
              <div className="mt-6 h-[4px] w-full rounded-full bg-gradient-to-r from-transparent via-fuchsia-300/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>
          ))}
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;