// src/pages/admin/FacultyDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../adm_components/AdminLayout.jsx";
import { getFacultyById, getFacultySubmissions, deleteFaculty, deleteSubmission } from "../../utils/adminClient.js";

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

    const handleDeleteFaculty = async () => {
        if (window.confirm('Are you sure you want to delete this faculty? This action cannot be undone.')) {
            try {
                await deleteFaculty(facultyId);
                alert("Faculty deleted successfully");
                navigate("/admin/faculty");
            } catch (err) {
                console.error(err);
                alert("Failed to delete faculty");
            }
        }
    };

    const handleDeleteSubmission = async (code, id) => {
        if (window.confirm('Are you sure you want to delete this submission?')) {
            try {
                await deleteSubmission(code, id);
                setSubmissions(prev => prev.filter(s => s.id !== id));
            } catch (err) {
                console.error(err);
                alert("Failed to delete submission");
            }
        }
    };

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
            <div className="flex flex-col gap-8 text-[1.22rem]">

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
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center w-full justify-between">
                        <div className="flex items-center gap-5">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-700 flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0">
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
                                <h2 className="text-2xl font-bold text-slate-900">{faculty.name}</h2>
                                <div className="mt-1 flex flex-wrap gap-x-6 gap-y-2 text-slate-600 text-base">
                                    <span className="flex items-center gap-1">
                                        <span className="font-medium text-slate-800">Email:</span> {faculty.email}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="font-medium text-slate-800">Department:</span> {faculty.dept}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="font-medium text-slate-800">Designation:</span> {faculty.designation}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 flex justify-end">
                            <button
                                onClick={handleDeleteFaculty}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-sm text-lg"
                            >
                                Delete Faculty
                            </button>
                        </div>
                    </div>
                </div>

                {/* Submissions Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-slate-900">Submission History</h3>
                        <button
                            onClick={handleExport}
                            disabled={submissions.length === 0}
                            className="px-4 py-2 bg-fuchsia-50 text-fuchsia-700 rounded-lg hover:bg-fuchsia-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Export to Excel
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50 text-[1.22rem]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Proof</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {submissions.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No submissions found for this faculty.</td>
                                        </tr>
                                    ) : (
                                        submissions.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-slate-900">{sub.title}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-lg text-slate-600">{sub.category}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-lg text-slate-600">{sub.date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-lg font-medium">
                                                    <a
                                                        href={sub.docUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 hover:underline"
                                                        download
                                                    >
                                                        Download Proof
                                                    </a>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-lg font-medium">
                                                    <button
                                                        onClick={() => handleDeleteSubmission(sub.category, sub.id)}
                                                        className="px-4 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold"
                                                    >
                                                        Delete
                                                    </button>
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
