import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProfessionalSocietyForm from "../forms/ProfessionalSocietyForm";
import FdpResourcePersonForm from "../forms/FdpResourcePersonForm";
import FdpParticipationForm from "../forms/FdpParticipationForm";
import MoocCertificationForm from "../forms/MoocCertificationForm";
import MagicAIUpload from "../../components/public/MagicAIUpload";
import { Sparkles } from "lucide-react";

const MagicLinkPage = () => {
    const { token } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [linkData, setLinkData] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // AI Auto-Fill Logic
    const [showAIUpload, setShowAIUpload] = useState(false);
    const [prefilledData, setPrefilledData] = useState(null);
    const [prefilledFile, setPrefilledFile] = useState(null);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const res = await fetch(`/api/public/magic-link/${token}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Invalid or expired link");
                }

                setLinkData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        verifyToken();
    }, [token]);

    const handleCustomSubmit = async (formData) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

            const res = await fetch("/api/public/submit-magic", {
                method: "POST",
                body: formData, // FormData handles file uploads automatically
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Submission failed");

            setSubmitSuccess(true);
            return { success: true };
        } catch (err) {
            console.error(err);
            let errorMessage = err.message;
            if (err.name === 'AbortError') {
                errorMessage = "Request timed out. Please check your connection.";
            }
            return { success: false, message: errorMessage };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 flex items-center justify-center">
                <div className="p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl text-center">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white font-medium text-lg tracking-wide">Verifying Secure Access...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center border-t-4 border-red-500">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <p className="text-sm text-slate-400">Please contact the administrator if you believe this is an error.</p>
                </div>
            </div>
        );
    }

    if (submitSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-900 to-emerald-900 flex items-center justify-center p-4">
                <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-10 text-center animate-fade-in-up">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Submission Successful!</h2>
                    <p className="text-lg text-slate-600 mb-8">
                        Thank you, <span className="font-semibold text-slate-900">{linkData.facultyName}</span>. Your details have been securely recorded.
                    </p>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-sm text-slate-500">You may close this window now.</p>
                    </div>
                </div>
            </div>
        );
    }



    const handleDataExtracted = (data, type, file) => {
        setPrefilledData(data);
        if (file) setPrefilledFile(file);
        setShowAIUpload(false);
        // Optional: Show a toast or message
    };

    // Render the appropriate form based on section code
    const renderForm = () => {
        const commonProps = {
            customSubmitHandler: (payload, file) => {
                const formData = new FormData();
                formData.append("token", token);
                formData.append("payload", JSON.stringify(payload));
                if (file) {
                    formData.append("file", file);
                }
                return handleCustomSubmit(formData);
            },
            isMagicLink: true,
            lockedName: linkData.facultyName,
            prefilledData: prefilledData, // Pass AI data
            prefilledFile: prefilledFile  // Pass AI file
        };

        switch (linkData.sectionCode) {
            case "6.1.1.1": return <ProfessionalSocietyForm {...commonProps} />;
            case "6.1.2.1.1": return <FdpResourcePersonForm {...commonProps} />;
            case "6.1.2.2.1": return <FdpParticipationForm {...commonProps} />;
            case "6.1.4.1": return <MoocCertificationForm {...commonProps} />;
            default: return <div className="text-center text-red-500 p-10">Unknown Form Type: {linkData.sectionCode}</div>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Premium Header */}
            <header className="bg-gradient-to-r from-indigo-900 via-purple-900 to-fuchsia-900 text-white py-12 px-4 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-5xl mx-auto relative z-10 text-center">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-semibold tracking-wider uppercase mb-4">
                        Secure Submission Portal
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
                        Faculty Data Submission
                    </h1>
                    <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto leading-relaxed">
                        Welcome, <span className="font-semibold text-white border-b-2 border-fuchsia-400 pb-0.5">{linkData.facultyName}</span>. Please complete the form below.
                    </p>
                </div>
            </header>

            {/* Form Container */}
            <main className="max-w-5xl mx-auto px-4 -mt-10 pb-20 relative z-20">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Form Type</span>
                        <span className="px-3 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-bold">
                            Section {linkData.sectionCode}
                        </span>
                    </div>

                    <div className="p-6 md:p-10">
                        {/* AI Auto-Fill Toggle */}
                        {!showAIUpload && !prefilledData && (
                            <div className="mb-8">
                                <button
                                    onClick={() => setShowAIUpload(true)}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-dashed border-indigo-200 rounded-xl text-indigo-700 font-semibold hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <div className="p-1.5 bg-indigo-200 rounded-lg group-hover:bg-indigo-300 transition-colors">
                                        <Sparkles className="w-5 h-5 text-indigo-700" />
                                    </div>
                                    <span>Auto-fill form with AI (Upload Certificate)</span>
                                </button>
                            </div>
                        )}

                        {/* AI Upload Component */}
                        {showAIUpload && (
                            <MagicAIUpload
                                onDataExtracted={handleDataExtracted}
                                onClose={() => setShowAIUpload(false)}
                            />
                        )}

                        {prefilledData && (
                            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between animate-fade-in">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-full">
                                        <Sparkles className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-green-800 font-semibold">Data Auto-Filled by AI</p>
                                        <p className="text-green-600 text-xs">Please review the fields below.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setPrefilledData(null); setShowAIUpload(true); }}
                                    className="text-xs text-green-700 underline hover:text-green-900"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {renderForm()}
                    </div>
                </div>

                <div className="mt-8 text-center text-slate-400 text-sm">
                    &copy; {new Date().getFullYear()} AICTE Portal. Secure & Encrypted.
                </div>
            </main>
        </div>
    );
};

export default MagicLinkPage;
