// src/pages/faculty/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import FacultySidebar from "../../components/faculty/FacultySidebar";
import {
  getDefaultFacultyNavItems,
  getProfileNavItem,
  getHelpNavItem,
} from "../../utils/facultyNav";

const FacultyDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [submissionCount, setSubmissionCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);
  const navItems = getDefaultFacultyNavItems(navigate, "dashboard");
  const profileItem = getProfileNavItem(navigate, false);
  const helpItem = getHelpNavItem(navigate);

  useEffect(() => {
    if (!user) return;
    let isActive = true;

    const loadSubmissionStats = async () => {
      try {
        setStatsLoading(true);
        const res = await fetch("/api/submissions/mysubmissions", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Failed to load submissions");
        const data = await res.json();
        if (isActive) {
          setSubmissionCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (err) {
        console.error("Unable to load submission stats", err);
        if (isActive) setSubmissionCount(0);
      } finally {
        if (isActive) setStatsLoading(false);
      }
    };

    loadSubmissionStats();

    return () => {
      isActive = false;
    };
  }, [user]);

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
      title: "✨ AI Certificate Upload",
      description:
        "Upload certificates and let AI automatically extract and fill all details for you!",
      onClick: () => navigate("/ai-upload"),
      accent: "border-purple-400 hover:border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50",
      badge: "NEW",
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
    {
      label: "Total Submissions",
      value: statsLoading ? "--" : submissionCount,
      dotColor: "bg-indigo-500",
      background: "bg-slate-100",
    },
  ];


  return (
    <div
      className="min-h-screen flex"
      style={{
        // Assuming a standard professional font like 'Inter' is applied globally
        backgroundImage: "linear-gradient(135deg, #f8f2ff 0%, #fff4ea 100%)",
      }}
    >
      <FacultySidebar
        navItems={navItems}
        profileItem={profileItem}
        helpItem={helpItem}
        onLogout={onLogout}
      />

      {/* ➡️ RIGHT: header + dashboard content (Added margin for fixed sidebar) */}
      <div className="flex-1 flex flex-col md:ml-80">
        {/* Header – now taller, bigger title */}
        <Header title="Faculty Dashboard" user={user} onLogout={onLogout} />

        {/* Main content */}
        <main className="flex-1 px-4 sm:px-8 py-6">
          <div className="max-w-6xl mx-auto flex flex-col gap-8"> {/* Increased gap */}
            {/* Welcome + quick stats */}
            <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
              <div>
                <h2 className="text-4xl sm:text-5xl font-semibold text-slate-900">
                  WELCOME,{" "}
                  <span className="uppercase">
                    {user?.name || user?.email || "Faculty Member"}
                  </span>
                </h2>
                <p className="mt-2 text-lg text-slate-700">
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
                    <span className="text-4xl font-extrabold text-slate-900 leading-none">
                      {stat.value}
                    </span>
                    <span className="mt-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-600 text-center">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
              {/* END IMPROVED STATS DESIGN */}

            </section>

            {/* Cards grid – cards narrower, taller, bigger text */}
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {cards.map((card) => (
                <button
                  key={card.key}
                  onClick={card.onClick}
                  className={`group relative text-left bg-white/95 rounded-2xl border ${card.accent} shadow-md hover:shadow-lg px-6 py-7 transition-all duration-200 hover:-translate-y-[4px] focus:outline-none focus:ring-2 focus:ring-indigo-300 min-h-[190px] sm:min-h-[210px]`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                        {card.title}
                      </h3>
                      <p className="text-lg text-slate-600 leading-snug">
                        {card.description}
                      </p>
                    </div>
                    {card.badge && (
                      <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${card.badge === 'NEW'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
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
              <p className="text-base text-slate-500 text-center">
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

export default FacultyDashboard;