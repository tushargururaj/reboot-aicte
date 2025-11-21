// src/pages/admin/SubmissionTable.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../adm_components/AdminLayout.jsx";
import { getCategoryReport } from "../../utils/adminClient.js";

const SubmissionTable = ({ user, onLogout }) => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Map categoryId to readable title
    const categoryTitles = {
        "6.1.1.1": "Professional Society Memberships",
        "6.1.2.1.1": "STTP/FDP Resource Person",
        "6.1.2.2.1": "External STTP/FDP Participation",
        "6.1.4.1": "MOOC Certification Acquired"
    };
    const categoryTitle = categoryTitles[categoryId] || categoryId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const data = await getCategoryReport(categoryId);
                setSubmissions(data);
            } catch (error) {
                console.error("Failed to fetch submissions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, [categoryId]);

    // Define columns based on category
    const getColumns = () => {
        switch (categoryId) {
            case "6.1.1.1":
                return [
                    { key: "sn", label: "S.N.", render: (_, idx) => idx + 1 },
                    { key: "faculty_name", label: "Name of the Faculty", render: (row) => row.facultyName },
                    { key: "society_name", label: "Name of the Professional Society/Body", render: (row) => row.title },
                    { key: "grade_level", label: "Name of the Grade/Level/Position", render: (row) => row.grade_level || "N/A" }
                ];
            case "6.1.2.1.1":
                return [
                    { key: "sn", label: "S.N.", render: (_, idx) => idx + 1 },
                    { key: "faculty_name", label: "Name of the Faculty as Resource Person", render: (row) => row.facultyName },
                    { key: "event_name", label: "Name of the STTP/FDP", render: (row) => row.title },
                    { key: "date", label: "Date", render: (row) => row.date || "N/A" },
                    { key: "location", label: "Location", render: (row) => row.location || "N/A" },
                    { key: "organizer", label: "Organized by", render: (row) => row.organizer || "N/A" }
                ];
            case "6.1.2.2.1":
                return [
                    { key: "sn", label: "S.N.", render: (_, idx) => idx + 1 },
                    { key: "faculty_name", label: "Name of the Faculty as Resource Person or Participant", render: (row) => row.facultyName },
                    { key: "event_name", label: "Name of the Program", render: (row) => row.title },
                    { key: "date", label: "Date", render: (row) => row.date || "N/A" }
                ];
            case "6.1.4.1":
                return [
                    { key: "sn", label: "S.N.", render: (_, idx) => idx + 1 },
                    { key: "faculty_name", label: "Name of the Faculty", render: (row) => row.facultyName },
                    { key: "course_name", label: "Name of Course Passed", render: (row) => row.title },
                    { key: "agency", label: "Course Offered by (agency)", render: (row) => row.agency || "N/A" },
                    { key: "grade", label: "Grade obtained if any", render: (row) => row.grade_obtained || "N/A" }
                ];
            default:
                return [
                    { key: "sn", label: "S.N.", render: (_, idx) => idx + 1 },
                    { key: "faculty_name", label: "Faculty Name", render: (row) => row.facultyName },
                    { key: "title", label: "Title / Topic", render: (row) => row.title },
                    { key: "date", label: "Date", render: (row) => row.date || "N/A" }
                ];
        }
    };

    const columns = getColumns();

    const handleExport = () => {
        if (!submissions.length) return;

        // Export only the data columns (not the Proof column)
        const headers = columns.map(col => col.label);
        const rows = submissions.map((sub, idx) =>
            columns.map(col => col.render(sub, idx))
        );

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(item => `"${item}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${categoryId}_submissions.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Render CAY grouped table for 6.1.2.1.1
    const renderCAYGroupedTable = () => {
        const groups = {
            'CAY': submissions.filter(s => s.cayGroup === 'CAY'),
            'CAYm1': submissions.filter(s => s.cayGroup === 'CAYm1'),
            'CAYm2': submissions.filter(s => s.cayGroup === 'CAYm2'),
            'CAYm3': submissions.filter(s => s.cayGroup === 'CAYm3'),
        };

        return (
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-gradient-to-r from-yellow-50 to-slate-100 text-slate-700">
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} className="px-6 py-5 text-left text-sm font-bold uppercase tracking-wider border-b border-slate-200">
                                {col.label}
                            </th>
                        ))}
                        <th className="px-6 py-5 text-right text-sm font-bold uppercase tracking-wider border-b border-slate-200">Proof</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                    {loading ? (
                        <tr><td colSpan={columns.length + 1} className="px-6 py-8 text-center text-slate-500 text-lg">Loading...</td></tr>
                    ) : (
                        Object.entries(groups).map(([groupName, groupSubmissions]) => (
                            <React.Fragment key={groupName}>
                                <tr className="bg-slate-50/50 border-t border-slate-200">
                                    <td colSpan={columns.length + 1} className="px-6 py-4 text-center text-xl font-bold text-slate-700 uppercase tracking-wide">
                                        {groupName}
                                    </td>
                                </tr>
                                {groupSubmissions.length === 0 ? (
                                    <tr><td colSpan={columns.length + 1} className="px-6 py-6 text-center text-slate-400 italic text-base">No data for {groupName}</td></tr>
                                ) : (
                                    groupSubmissions.map((sub, idx) => (
                                        <tr key={sub.id} className="hover:bg-yellow-50/30 transition-colors duration-200">
                                            {columns.map((col) => (
                                                <td key={col.key} className="px-6 py-4 whitespace-nowrap text-base text-slate-600">
                                                    {col.render(sub, idx)}
                                                </td>
                                            ))}
                                            <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                                                <a
                                                    href={sub.docUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-block px-4 py-1.5 rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200 text-xs font-bold transition-colors"
                                                >
                                                    View
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </React.Fragment>
                        ))
                    )}
                </tbody>
            </table>
        );
    };

    // Render CAY column-based table for 6.1.2.2.1
    const renderCAYColumnTable = () => {
        // Group submissions by faculty
        const facultyMap = new Map();
        submissions.forEach(sub => {
            if (!facultyMap.has(sub.facultyName)) {
                facultyMap.set(sub.facultyName, { cay: 0, caym1: 0, caym2: 0, caym3: 0 });
            }
            const counts = facultyMap.get(sub.facultyName);
            const marks = Number(sub.marks) || 0;

            if (sub.cayGroup === 'CAY') counts.cay += marks;
            else if (sub.cayGroup === 'CAYm1') counts.caym1 += marks;
            else if (sub.cayGroup === 'CAYm2') counts.caym2 += marks;
            else if (sub.cayGroup === 'CAYm3') counts.caym3 += marks;
        });

        return (
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-gradient-to-r from-yellow-50 to-slate-100 text-slate-700">
                    <tr>
                        <th rowSpan="2" className="px-6 py-5 text-left text-sm font-bold uppercase tracking-wider border-r border-slate-200/60 border-b border-slate-200">S.N.</th>
                        <th rowSpan="2" className="px-6 py-5 text-left text-sm font-bold uppercase tracking-wider border-r border-slate-200/60 border-b border-slate-200">Name of the Faculty as Resource Person or Participant</th>
                        <th colSpan="4" className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider border-b border-slate-200">Max. 5 per Faculty</th>
                    </tr>
                    <tr>
                        <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider bg-white/30 border-r border-slate-200/60 border-b border-slate-200 backdrop-blur-sm">CAY</th>
                        <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider bg-white/30 border-r border-slate-200/60 border-b border-slate-200 backdrop-blur-sm">CAYm1</th>
                        <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider bg-white/30 border-r border-slate-200/60 border-b border-slate-200 backdrop-blur-sm">CAYm2</th>
                        <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider bg-white/30 border-b border-slate-200 backdrop-blur-sm">CAYm3</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                    {loading ? (
                        <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500 text-lg">Loading...</td></tr>
                    ) : submissions.length === 0 ? (
                        <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500 text-lg">No submissions found.</td></tr>
                    ) : (
                        Array.from(facultyMap.entries()).map(([facultyName, counts], idx) => (
                            <tr key={idx} className="hover:bg-yellow-50/30 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap text-base text-slate-600 border-r border-slate-100">{idx + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-base text-slate-600 border-r border-slate-100 font-medium">{facultyName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-base text-center text-slate-600 border-r border-slate-100">{counts.cay || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-base text-center text-slate-600 border-r border-slate-100">{counts.caym1 || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-base text-center text-slate-600 border-r border-slate-100">{counts.caym2 || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-base text-center text-slate-600">{counts.caym3 || '-'}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        );
    };

    return (
        <AdminLayout user={user} onLogout={onLogout} title="Review Submissions" activeKey="review-submissions">
            <div className="flex flex-col gap-8 max-w-[95%] mx-auto py-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/admin/submissions")}
                            className="flex items-center justify-center w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                            title="Back to Categories"
                        >
                            <span className="text-2xl pb-1">←</span>
                        </button>
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{categoryTitle}</h2>
                            <p className="text-slate-500 font-medium mt-1">Table No. {categoryId}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={submissions.length === 0}
                        className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
                    >
                        <span>Export Excel</span>
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden ring-1 ring-slate-900/5">
                    <div className="overflow-x-auto">
                        {categoryId === '6.1.2.1.1' ? renderCAYGroupedTable() :
                            categoryId === '6.1.2.2.1' ? renderCAYColumnTable() : (
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-gradient-to-r from-yellow-50 to-slate-100 text-slate-700">
                                        <tr>
                                            {columns.map((col) => (
                                                <th key={col.key} className="px-6 py-5 text-left text-sm font-bold uppercase tracking-wider border-b border-slate-200">
                                                    {col.label}
                                                </th>
                                            ))}
                                            <th className="px-6 py-5 text-right text-sm font-bold uppercase tracking-wider border-b border-slate-200">Proof</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-slate-500 text-lg">Loading submissions...</td>
                                            </tr>
                                        ) : submissions.length === 0 ? (
                                            <tr>
                                                <td colSpan={columns.length + 1} className="px-6 py-8 text-center text-slate-500 text-lg">No submissions found.</td>
                                            </tr>
                                        ) : (
                                            submissions.map((sub, idx) => (
                                                <tr key={sub.id} className="hover:bg-yellow-50/30 transition-colors duration-200">
                                                    {columns.map((col) => (
                                                        <td key={col.key} className="px-6 py-4 whitespace-nowrap text-base text-slate-600">
                                                            {col.render(sub, idx)}
                                                        </td>
                                                    ))}
                                                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                                                        <a
                                                            href={sub.docUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-block px-4 py-1.5 rounded-full bg-yellow-100 text-yellow-800 hover:bg-yellow-200 text-xs font-bold transition-colors"
                                                        >
                                                            View Certificate
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
};

export default SubmissionTable;
