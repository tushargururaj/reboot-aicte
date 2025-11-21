// src/pages/NewSubmission.jsx
import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import { getDraftsForUser } from "../utils/submissionsClient";

// 📝 NOTE: If 'Inter' font is not globally imported (e.g., in index.html or index.css), 
// it won't be applied. Assuming a global font setup for this change.

const submissionTypes = [
  // ... (submissionTypes array remains unchanged)
  {
    key: "6.1.1.1",
    section: "6.1.1",
    tableNo: "Table No. 6.1.1.1",
    title: "Professional Society Memberships",
    focus:
      "Active memberships (National/International), position, and contribution.",
    active: true,
  },
  {
    key: "6.1.2.1.1",
    section: "6.1.2.1",
    tableNo: "Table No. 6.1.2.1.1",
    title: "STTP/FDP Resource Person",
    focus:
      "Details of being a resource person (speaker/trainer) in STTP/FDP events.",
    active: true,
  },
  {
    key: "6.1.2.2.1",
    section: "6.1.2.2",
    tableNo: "Table No. 6.1.2.2.1",
    title: "External STTP/FDP Participation",
    focus: "Participation in FDPs/STTPs held outside the parent institution.",
    active: true,
  },
  {
    key: "6.1.3.1",
    section: "6.1.3",
    tableNo: "Table No. 6.1.3.1",
    title: "Developed MOOCs/E-Content",
    focus:
      "Courses developed for platforms like SWAYAM, NPTEL, or other e-content.",
    active: false,
  },
  {
    key: "6.1.4.1",
    section: "6.1.4",
    tableNo: "Table No. 6.1.4.1",
    title: "MOOC Certification Acquired",
    focus: "Certification obtained for MOOCs (e.g., SWAYAM, NPTEL, etc.).",
    active: true,
  },
  {
    key: "6.1.5.1",
    section: "6.1.5",
    tableNo: "Table No. 6.1.5.1",
    title: "FDP/STTP Organized by Department",
    focus:
      "Organization details for FDPs/STTPs (min. 5 days) by the Department.",
    active: false,
  },
  {
    key: "6.1.6.1",
    section: "6.1.6",
    tableNo: "Table No. 6.1.6.1",
    title: "Support for Student Innovative Projects",
    focus:
      "Mentoring/facilitating students in hackathons, ideathons, or projects.",
    active: false,
  },
  {
    key: "6.1.7.1",
    section: "6.1.7",
    tableNo: "Table No. 6.1.7.1",
    title: "Industry Internship/Training/Collaboration",
    focus:
      "Internships, training, or collaboration with industry/research orgs.",
    active: false,
  },
  {
    key: "6.2.1.1",
    section: "6.2.1",
    tableNo: "Table No. 6.2.1.1",
    title: "Academic Publications (Journals/Conferences)",
    focus: "Peer-reviewed publications, books, or book chapters.",
    active: false,
  },
  {
    key: "6.2.2.1",
    section: "6.2.2",
    tableNo: "Table No. 6.2.2.1",
    title: "Ph.D. Students (Enrolled/Graduated)",
    focus:
      "Ph.D. students enrolled or who have graduated under your supervision.",
    active: false,
  },
  {
    key: "6.2.4.1",
    section: "6.2.4",
    tableNo: "Table No. 6.2.4.1",
    title: "External Sponsored Research Project",
    focus:
      "Research projects with external funding (PI/Co-PI, agency, amount).",
    active: false,
  },
  {
    key: "6.2.5.1",
    section: "6.2.5",
    tableNo: "Table No. 6.2.5.1",
    title: "External Consultancy Work",
    focus:
      "Consultancy projects with external funding (PI/Co-PI, agency, amount).",
    active: false,
  },
  {
    key: "6.2.6.1",
    section: "6.2.6",
    tableNo: "Table No. 6.2.6.1",
    title: "Institution Seed Money/Internal Grant",
    focus: "Research grants or seed money received from the institution.",
    active: false,
  },
];


const NewSubmission = ({ user, onBack, onLogout }) => {
  const navigate = useNavigate();

  const userId = user?.id || user?.email || "anonymous";
  const draftCount = useMemo(
    () => getDraftsForUser(userId).length, 
    [userId]
  );
  
  return (
    <div
      className="min-h-screen flex"
      style={{
        backgroundImage: "linear-gradient(135deg, #f8f2ff 0%, #fff4ea 100%)",
      }}
    >
      {/* ⬅️ LEFT: Fixed Sidebar (w-80 and h-screen) */}
      <aside className="hidden md:flex flex-col w-80 fixed top-0 left-0 h-screen bg-gradient-to-b from-indigo-950 to-purple-900 text-white shadow-2xl z-20">
        <div className="px-7 pt-7 pb-5 border-b border-white/10">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60 mb-1">
            AICTE Portal
          </div>
          <div className="text-2xl font-semibold tracking-wide">
            Faculty Panel
          </div>
        </div>

        <nav className="flex-1 px-4 pt-5 space-y-1 text-lg">
          <SidebarItem
            label="Dashboard"
            icon=">"
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
            active
            onClick={() => navigate("/new-submission")}
          />
          <SidebarItem
            label="Drafts"
            icon=">"
            onClick={() => navigate("/faculty-drafts")}
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
            <span className="text-lg">Logout</span>
          </button>
        </div>
      </aside>

      {/* ➡️ RIGHT: Content Area (Adjusted margin to account for fixed sidebar) */}
      <div className="flex-1 flex flex-col md:ml-80">
        <Header title="New Submission" user={user} onLogout={onLogout} />

        <main className="flex-1 px-4 sm:px-8 py-6">
          <div className="max-w-6xl mx-auto flex flex-col gap-8"> {/* Increased gap */}
            {/* Top row: back + title + drafts */}
            <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center gap-2 text-sm text-indigo-700 hover:text-indigo-500 transition-colors" // Increased text size
                >
                  <span className="text-xl">←</span>
                  <span>Back to Dashboard</span>
                </button>
                <div>
                  <h2 className="text-3xl font-semibold text-slate-900"> {/* Increased text size */}
                    Create New Submission
                  </h2>
                  <p className="mt-1 text-base text-slate-700"> {/* Increased text size */}
                    Select the contribution type to open its detailed form and
                    upload supporting certificates.
                  </p>
                </div>
              </div>
              <div className="flex justify-start sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/faculty-drafts")}
                  // 🚀 Increased size and font weight for "View Drafts" button
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-indigo-200 bg-white/80 text-sm font-semibold text-indigo-700 shadow-sm hover:shadow-md hover:border-indigo-400 hover:bg-white transition-all duration-150"
                >
                  <span>View Drafts</span>
                  <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                    {draftCount}
                  </span>
                </button>
              </div>
            </section>

            {/* Info banner */}
            <section className="bg-white/80 rounded-xl border border-indigo-100 shadow-sm px-4 py-3 text-base text-slate-700"> {/* Increased text size */}
              <p>
                Fields and formats on this page are aligned with the SAR tables
                (Section 6.1 & 6.2). You can start filling a submission, save it
                as a draft, and complete it later.
              </p>
            </section>

            {/* Cards grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {submissionTypes.map((type) => (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => navigate(`/new-submission/${type.key}`)}
                  className={`group relative text-left bg-white/95 rounded-2xl border shadow-sm px-5 py-5 min-h-[170px] sm:min-h-[190px] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-md ${
                    type.active
                      ? "border-slate-200 hover:border-indigo-400 cursor-pointer"
                      : "border-slate-200/80 hover:border-slate-300 cursor-default opacity-70"
                  }`}
                  disabled={!type.active}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 border border-slate-200"> {/* Increased text size */}
                      Section {type.section}
                    </span>
                    {!type.active && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-50 text-xs font-semibold text-slate-400 border border-slate-200"> {/* Increased text size */}
                        Coming later
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-1"> {/* Increased text size */}
                    {type.title}
                  </h3>
                  <p className="text-base text-slate-600 leading-snug"> {/* Increased text size */}
                    {type.focus}
                  </p>
                  <p className="mt-2 text-xs text-slate-500"> {/* Increased text size */}
                    {type.tableNo}
                  </p>
                  <div className="mt-3 h-[3px] w-full rounded-full bg-gradient-to-r from-transparent via-indigo-300/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </button>
              ))}
            </section>

            {/* Placeholder message (font size increased) */}
            <section className="mt-2 mb-4">
              <p className="text-base text-slate-500 text-center">
                Click one of the active contribution cards above to open the
                submission form.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

// Sidebar item component (Updated for no-emojis and increased size)
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
      <span className="text-lg font-bold">{icon}</span>
      <span className="text-base">{label}</span>
    </button>
  );
};

export default NewSubmission;