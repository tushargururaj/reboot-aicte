// src/pages/admin/FacultyDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../adm_components/AdminLayout.jsx";
import { getFacultyById, getFacultySubmissions } from "../../utils/adminClient.js";

const FacultyDetails = ({ user, onLogout }) => {
    const { facultyId } = useParams();
    const navigate = useNavigate();
    const [faculty, setFaculty] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [facData, subData] = await Promise.all([
                    getFacultyById(facultyId),
                    getFacultySubmissions(facultyId)
                ]);
                setFaculty(facData);
                setSubmissions(subData);
            } catch (error) {
                console.error("Error fetching faculty details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [facultyId]);

    const handleExport = () => {
        // Simple CSV Export for this faculty's submissions
        if (!submissions.length) return;

        const headers = ["Title", "Category", "Date"];
        const rows = submissions.map(s => [s.title, s.category, s.date]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(item => `"${item}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${faculty?.name || 'faculty'}_submissions.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <AdminLayout user={user} onLogout={onLogout} title="Faculty Details" activeKey="manage-faculty">
                <div className="p-8 text-center text-slate-500">Loading details...</div>
            </AdminLayout>
        );
    }

    if (!faculty) {
        return (
            <AdminLayout user={user} onLogout={onLogout} title="Faculty Details" activeKey="manage-faculty">
                <div className="p-8 text-center text-red-500">Faculty not found.</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout user={user} onLogout={onLogout} title="Faculty Details" activeKey="manage-faculty">
            <div className="flex flex-col gap-8">

                {/* Back Button */}
                <div>
                    <button
                        onClick={() => navigate("/admin/faculty")}
                        className="text-slate-500 hover:text-fuchsia-700 flex items-center gap-2 transition-colors"
                    >
                        <span>←</span> Back to Faculty List
                    </button>
                </div>

                {/* Faculty Info Header */}
                <div className="bg-gradient-to-r from-yellow-50 to-slate-100 p-8 rounded-xl border border-slate-200 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-7">
                        {/* Avatar */}
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-700 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shrink-0">
                            {(() => {
                                const name = faculty.name || "";
                                const cleanName = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.)\s+/i, "");
                                const parts = cleanName.trim().split(" ");
                                if (parts.length === 0) return "";
                                if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
                                return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
                            })()}
                        </div>

                        <div>
                            <h2 className="text-3xl font-extrabold text-slate-900">{faculty.name}</h2>
                            <div className="mt-2 flex flex-wrap gap-x-8 gap-y-3 text-slate-700 text-lg">
                                <span className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800">Email:</span> {faculty.email}
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800">Department:</span> {faculty.dept}
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800">Designation:</span> {faculty.designation}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submissions Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-slate-900">Submission History</h3>
                        <button
                            onClick={handleExport}
                            disabled={submissions.length === 0}
                            className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2 text-lg"
                        >
                            Export to Excel
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden ring-1 ring-slate-900/5">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-[1.15rem]">
                                <thead className="bg-gradient-to-r from-yellow-50 to-slate-100 text-slate-700">
                                    <tr>
                                        <th className="px-8 py-6 text-left text-lg font-bold uppercase tracking-wider border-b border-slate-200">Title</th>
                                        <th className="px-8 py-6 text-left text-lg font-bold uppercase tracking-wider border-b border-slate-200">Category</th>
                                        <th className="px-8 py-6 text-left text-lg font-bold uppercase tracking-wider border-b border-slate-200">Date</th>
                                        <th className="px-8 py-6 text-right text-lg font-bold uppercase tracking-wider border-b border-slate-200">Proof</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {submissions.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-10 text-center text-slate-500 text-xl">No submissions found for this faculty.</td>
                                        </tr>
                                    ) : (
                                        submissions.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-yellow-50/30 transition-colors duration-200">
                                                <td className="px-8 py-5 whitespace-nowrap text-lg font-semibold text-slate-900">{sub.title}</td>
                                                <td className="px-8 py-5 whitespace-nowrap text-lg text-slate-700">{sub.category}</td>
                                                <td className="px-8 py-5 whitespace-nowrap text-lg text-slate-700">{sub.date}</td>
                                                <td className="px-8 py-5 whitespace-nowrap text-right text-lg font-semibold">
                                                    <a
                                                        href={sub.docUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 hover:underline text-lg font-bold"
                                                    >
                                                        View / Download
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
};

export default FacultyDetails;
