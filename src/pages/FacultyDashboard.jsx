// src/pages/FacultyDashboard.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

// Mock submissions for now (later plug into api/submissions.js)
const mockSubmissions = [
  { id: 3, status: "Rejected" },
];

const FacultyDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const totalCount = mockSubmissions.length;

  // Note: Profile is now before AI Upload (swapped)
  const cards = [
    {
      key: "view-submissions",
      title: "View Submissions",
      description:
        "Browse all your contributions, filter by status, and review remarks.",
      onClick: () => navigate("/faculty-submissions"),
      accent: "border-indigo-300 hover:border-indigo-400",
    },
    {
      key: "new-submission",
      title: "New Submission",
      description:
        "Quickly log a new publication, FDP, workshop, or other achievement.",
      onClick: () => navigate("/new-submission"),
      accent: "border-purple-300 hover:border-purple-400",
    },
    {
      key: "profile",
      title: "Your Profile",
      description:
        "Check and update your profile, department, designation, and contact details.",
      onClick: () => navigate("/profile"),
      accent: "border-indigo-300 hover:border-indigo-400",
    },
    {
      key: "ai-upload",
      title: "AI-enabled Upload",
      description:
        "Upload certificates and let AI pre-fill title, dates, and contribution type.",
      onClick: () => navigate("/ai-upload"),
      accent: "border-purple-300 hover:border-purple-400",
      badge: "Coming Soon",
    },
    {
      key: "events",
      title: "Upcoming Events",
      description:
        "Stay aware of FDPs, workshops, conferences, and submission deadlines.",
      onClick: () => navigate("/events"),
      accent: "border-indigo-300 hover:border-indigo-400",
    },
    {
      key: "guidelines",
      title: "Submission Guidelines",
      description:
        "Read clear instructions on what counts as a valid contribution and proof.",
      onClick: () => navigate("/guidelines"),
      accent: "border-purple-300 hover:border-purple-400",
    },
  ];

  // Helper data structure for the improved StatPills section
  const statData = [
    { label: "Total Submissions", value: totalCount, dotColor: "bg-indigo-500", background: "bg-slate-100" },
  ];


  return (
    <div
      className="min-h-screen flex"
      style={{
        // Assuming a standard professional font like 'Inter' is applied globally
        backgroundImage: "linear-gradient(135deg, #f8f2ff 0%, #fff4ea 100%)",
      }}
    >
      {/* ⬅️ LEFT: Fixed vertical sidebar (w-80) */}
      <aside className="hidden md:flex flex-col w-80 fixed top-0 left-0 h-screen bg-gradient-to-b from-indigo-950 to-purple-900 text-white shadow-2xl z-20">
        {/* Top: logo / title (Increased size) */}
        <div className="px-7 pt-7 pb-5 border-b border-white/10">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60 mb-1">
            AICTE Portal
          </div>
          <div className="text-2xl font-semibold tracking-wide">
            Faculty Panel
          </div>
        </div>

        {/* Main nav (Increased font size, removed emojis) */}
        <nav className="flex-1 px-4 pt-5 space-y-1 text-lg">
          <SidebarItem
            label="Dashboard"
            icon=">"
            active
            onClick={() => navigate("/faculty")}
          />
          <SidebarItem
            label="My Submissions"
            icon=">"
            onClick={() => navigate("/faculty-submissions")}
          />
          <SidebarItem
            label="New Submission"
            icon=">"
            onClick={() => navigate("/new-submission")}
          />
          <SidebarItem
            label="AI Upload"
            icon=">"
            onClick={() => navigate("/ai-upload")}
          />
          <SidebarItem
            label="Upcoming Events"
            icon=">"
            onClick={() => navigate("/events")}
          />
          <SidebarItem
            label="Profile"
            icon=">"
            onClick={() => navigate("/profile")}
          />
        </nav>

        {/* Bottom: help + logout (Increased font size, removed emoji) */}
        <div className="px-4 pb-6 pt-4 border-t border-white/10 space-y-2 text-lg">
          <SidebarItem
            label="Help & Support"
            icon=">"
            onClick={() => navigate("/help")}
          />
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-red-100 hover:bg-red-500/20 hover:text-white font-medium transition-all duration-150"
          >
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ➡️ RIGHT: header + dashboard content (Added margin for fixed sidebar) */}
      <div className="flex-1 flex flex-col md:ml-80">
        {/* Header – now taller, bigger title */}
        <Header title="Faculty Dashboard" user={user} onLogout={onLogout} />

        {/* Main content */}
        <main className="flex-1 px-4 sm:px-8 py-6">
          <div className="max-w-6xl mx-auto flex flex-col gap-8"> {/* Increased gap */}
            {/* Welcome + quick stats */}
            <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"> {/* Increased gap */}
              <div>
                <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900"> {/* Increased size */}
                  WELCOME,{" "}
                  <span className="uppercase">
                    {user?.name || user?.email || "Faculty Member"}
                  </span>
                </h2>
                <p className="mt-1 text-base text-slate-700"> {/* Increased size */}
                  Use the cards below or the left menu to quickly navigate to
                  your key tasks.
                </p>
              </div>

              {/* IMPROVED STATS DESIGN */}
              <div className="flex flex-wrap gap-4 justify-start sm:justify-end">
                {statData.map((stat) => (
                  <div
                    key={stat.label}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 shadow-sm min-w-[120px] ${stat.background}`}
                  >
                    <span className="text-3xl font-bold text-slate-900 leading-none">
                      {stat.value}
                    </span>
                    <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-600">
                      {stat.label.replace(' Submissions', '')}
                    </span>
                  </div>
                ))}
              </div>
              {/* END IMPROVED STATS DESIGN */}

            </section>

            {/* Cards grid – cards narrower, taller, bigger text */}
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {cards.map((card) => (
                <button
                  key={card.key}
                  onClick={card.onClick}
                  className={`group relative text-left bg-white/95 rounded-2xl border ${card.accent} shadow-sm hover:shadow-md px-5 py-6 transition-all duration-200 hover:-translate-y-[3px] focus:outline-none focus:ring-2 focus:ring-indigo-300 min-h-[170px] sm:min-h-[190px]`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2"> {/* Increased size */}
                        {card.title}
                      </h3>
                      <p className="text-base text-slate-600 leading-snug"> {/* Increased size */}
                        {card.description}
                      </p>
                    </div>
                    {card.badge && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 border border-slate-200">
                        {card.badge}
                      </span>
                    )}
                  </div>
                  {/* subtle bottom accent on hover */}
                  <div className="mt-4 h-[3px] w-full rounded-full bg-gradient-to-r from-transparent via-indigo-300/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </button>
              ))}
            </section>

            {/* Lower message area */}
            <section className="mt-2 pb-3">
              <p className="text-sm text-slate-500 text-center">
                More modules (analytics, download reports, and department-level
                summaries) can be added here as the portal grows.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

// Sidebar item helper component – bigger fonts + stronger active state
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
      {/* Icon is simply text to keep it professional and uniform */}
      <span className="text-base font-bold">{icon}</span>
      <span className="text-base">{label}</span>
    </button>
  );
};

export default FacultyDashboard;