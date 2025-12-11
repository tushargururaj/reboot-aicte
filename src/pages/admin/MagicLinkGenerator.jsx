import React, { useState, useEffect } from "react";
import { getFacultyList, generateMagicLink } from "../../utils/adminClient";
import AdminLayout from "../../components/admin/AdminLayout.jsx";

const MagicLinkGenerator = ({ user, onLogout }) => {
    const [facultyList, setFacultyList] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState("");
    const [selectedSection, setSelectedSection] = useState("6.1.1.1");
    const [reason, setReason] = useState("");
    const [generatedLink, setGeneratedLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");

    const sections = [
        { code: "6.1.1.1", name: "Professional Society Membership" },
        { code: "6.1.2.1.1", name: "Resource Person in FDP" },
        { code: "6.1.2.2.1", name: "Faculty Development Program (FDP)" },
        { code: "6.1.4.1", name: "MOOC Certification" },
    ];

    useEffect(() => {
        const fetchFaculty = async () => {
            try {
                const faculty = await getFacultyList();
                setFacultyList(faculty);
            } catch (err) {
                console.error("Failed to fetch faculty", err);
            }
        };
        fetchFaculty();
    }, []);

    // Auto-fill phone number when faculty is selected
    useEffect(() => {
        if (selectedFaculty) {
            const faculty = facultyList.find(f => f.id === parseInt(selectedFaculty));
            if (faculty && faculty.phone_number) {
                setPhoneNumber(faculty.phone_number);
            } else {
                setPhoneNumber("");
            }
        }
    }, [selectedFaculty, facultyList]);

    const handleGenerate = async () => {
        if (!selectedFaculty) return alert("Please select a faculty member");

        setLoading(true);
        try {
            const data = await generateMagicLink(selectedFaculty, selectedSection);
            setGeneratedLink(data.link);
        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to generate link");
        } finally {
            setLoading(false);
        }
    };

    const getWhatsAppUrl = () => {
        const message = `${reason ? reason + " - " : ""}Please fill out this form: ${generatedLink}`;
        const encodedMessage = encodeURIComponent(message);
        const phoneParam = phoneNumber ? phoneNumber.replace(/\D/g, '') : ""; // Strip non-digits
        return `https://wa.me/${phoneParam}?text=${encodedMessage}`;
    };

    return (
        <AdminLayout user={user} onLogout={onLogout} title="Magic Link Generator" activeKey="magic-links">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Generate Secure Link</h2>
                    <p className="text-slate-600 mt-1">Create a one-time submission link for faculty members.</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Select Faculty</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 outline-none transition-all"
                                    value={selectedFaculty}
                                    onChange={(e) => setSelectedFaculty(e.target.value)}
                                >
                                    <option value="">-- Choose Faculty --</option>
                                    {facultyList.map(f => (
                                        <option key={f.id} value={f.id}>{f.name} ({f.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Select Form Type</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 outline-none transition-all"
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
                                >
                                    {sections.map(s => (
                                        <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Reason / Message (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 outline-none transition-all placeholder-slate-400"
                                    placeholder="e.g. Urgent: NBA Visit Requirement"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">WhatsApp Number</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 outline-none transition-all placeholder-slate-400"
                                    placeholder="e.g. 919876543210"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                                <p className="text-xs text-slate-400 mt-1">Include country code (e.g., 91 for India) without +</p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full py-3.5 bg-gradient-to-r from-fuchsia-700 to-purple-800 text-white rounded-xl hover:from-fuchsia-800 hover:to-purple-900 transition-all shadow-md hover:shadow-xl font-semibold text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? "Generating Secure Link..." : "Generate Magic Link"}
                            </button>
                        </div>

                        {generatedLink && (
                            <div className="mt-8 p-6 bg-green-50 rounded-xl border border-green-200 animate-fade-in shadow-inner">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-green-100 rounded-full text-green-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-green-900">Link Generated Successfully!</h3>
                                </div>

                                <div className="flex items-center gap-3 mb-6">
                                    <input
                                        readOnly
                                        value={generatedLink}
                                        className="flex-1 p-3 text-sm bg-white border border-green-200 rounded-lg text-slate-600 font-mono shadow-sm"
                                    />
                                    <button
                                        onClick={() => navigator.clipboard.writeText(generatedLink)}
                                        className="p-3 bg-white border border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition-colors font-medium shadow-sm"
                                    >
                                        Copy
                                    </button>
                                </div>

                                <a
                                    href={getWhatsAppUrl()}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-3 w-full py-3 bg-[#25D366] text-white rounded-xl hover:bg-[#20bd5a] transition-all shadow-md hover:shadow-lg font-bold text-lg"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-8.683-2.031-9.667-.272-.099-.47-.149-.669-.149-.198 0-.42.001-.643.001-.223 0-.586.085-.892.413-.307.328-1.177 1.151-1.177 2.807 0 1.656 1.203 3.256 1.371 3.493.172.237 2.368 3.617 5.738 5.073 2.237.966 2.692.773 3.187.723.496-.05 1.584-.648 1.807-1.273.223-.625.223-1.161.156-1.273z" /></svg>
                                    Share via WhatsApp
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default MagicLinkGenerator;
