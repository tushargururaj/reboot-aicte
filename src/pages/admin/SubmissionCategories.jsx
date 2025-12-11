// src/pages/admin/SubmissionCategories.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

const SubmissionCategories = ({ user, onLogout }) => {
    const navigate = useNavigate();

    // Categories matching the Faculty "New Submission" sections exactly
    const submissionTypes = [
        {
            key: "6.1.1.1",
            section: "6.1.1",
            tableNo: "Table No. 6.1.1.1",
            title: "Professional Society Memberships",
            focus: "Active memberships (National/International), position, and contribution.",
            active: true,
        },
        {
            key: "6.1.2.1.1",
            section: "6.1.2.1",
            tableNo: "Table No. 6.1.2.1.1",
            title: "STTP/FDP Resource Person",
            focus: "Details of being a resource person (speaker/trainer) in STTP/FDP events.",
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
            focus: "Courses developed for platforms like SWAYAM, NPTEL, or other e-content.",
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
            focus: "Organization details for FDPs/STTPs (min. 5 days) by the Department.",
            active: false,
        },
        {
            key: "6.1.6.1",
            section: "6.1.6",
            tableNo: "Table No. 6.1.6.1",
            title: "Support for Student Innovative Projects",
            focus: "Mentoring/facilitating students in hackathons, ideathons, or projects.",
            active: false,
        },
        {
            key: "6.1.7.1",
            section: "6.1.7",
            tableNo: "Table No. 6.1.7.1",
            title: "Industry Internship/Training/Collaboration",
            focus: "Internships, training, or collaboration with industry/research orgs.",
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
            focus: "Ph.D. students enrolled or who have graduated under your supervision.",
            active: false,
        },
        {
            key: "6.2.4.1",
            section: "6.2.4",
            tableNo: "Table No. 6.2.4.1",
            title: "External Sponsored Research Project",
            focus: "Research projects with external funding (PI/Co-PI, agency, amount).",
            active: false,
        },
        {
            key: "6.2.5.1",
            section: "6.2.5",
            tableNo: "Table No. 6.2.5.1",
            title: "External Consultancy Work",
            focus: "Consultancy projects with external funding (PI/Co-PI, agency, amount).",
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

    return (
        <AdminLayout user={user} onLogout={onLogout} title="Review Submissions" activeKey="review-submissions">
            <div className="flex flex-col gap-6">

                {/* Back Button */}
                <div>
                    <button
                        onClick={() => navigate("/admin")}
                        className="text-slate-500 hover:text-fuchsia-700 flex items-center gap-2 transition-colors"
                    >
                        <span>←</span> Back to Dashboard
                    </button>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-slate-900">Browse Submissions</h2>
                    <p className="text-slate-600">Select a category to view and manage faculty contributions.</p>
                </div>

                {/* Cards grid matching NewSubmission.jsx style */}
                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {submissionTypes.map((type) => (
                        <button
                            key={type.key}
                            type="button"
                            onClick={() => navigate(`/admin/submissions/${type.key}`)}
                            className={`group relative text-left bg-white/95 rounded-2xl border shadow-sm px-5 py-5 min-h-[170px] sm:min-h-[190px] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-md ${type.active
                                ? "border-slate-200 hover:border-fuchsia-400 cursor-pointer"
                                : "border-slate-200/80 hover:border-slate-300 cursor-pointer opacity-80" // Allow clicking even inactive ones for admin review if needed, or keep consistent
                                }`}
                        >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 border border-slate-200">
                                    Section {type.section}
                                </span>
                                {!type.active && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-50 text-xs font-semibold text-slate-400 border border-slate-200">
                                        Coming later
                                    </span>
                                )}
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-1">
                                {type.title}
                            </h3>
                            <p className="text-base text-slate-600 leading-snug">
                                {type.focus}
                            </p>
                            <p className="mt-2 text-xs text-slate-500">
                                {type.tableNo}
                            </p>
                            {/* Hover accent */}
                            <div className="mt-3 h-[3px] w-full rounded-full bg-gradient-to-r from-transparent via-fuchsia-300/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </button>
                    ))}
                </section>

            </div>
        </AdminLayout>
    );
};

export default SubmissionCategories;
