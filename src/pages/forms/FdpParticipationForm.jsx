
// src/pages/forms/FdpParticipationForm.jsx
// Simple form for recording Faculty Development Program / STTP participation.
// Core responsibilities:
//  1. Maintain local form state for all fields
//  2. Allow selecting / drag–dropping a single proof file (certificate)
//  3. Save a local draft (localStorage) so progress is not lost
//  4. Submit final data + file to backend using commonHandleSubmit helper
//  5. Show a modal with success / error / info feedback
import React, { useEffect, useState } from "react"; // useState: local form + UI flags, useEffect: load existing draft
import { useNavigate } from "react-router-dom";
import FormLayout from "../../components/faculty/FormLayout";
import { saveDraft, commonHandleSubmit } from "../../utils/submissionsClient"; // helpers for drafts + submission flow
import SubmissionResultModal from "../../components/common/SubmissionResultModal";
import { getAcademicYearOptions } from "../../utils/dateUtils";


// Small presentational helper components (kept inline for simplicity)
const Label = ({ children }) => <label className="text-xs uppercase tracking-wide text-gray-600 font-medium block mb-1">{children}</label>;
const Input = ({ name, value, onChange, placeholder, type = "text", min = null }) => (
  <input type={type} name={name} value={value} min={min} onChange={onChange} placeholder={placeholder}
    className="w-full rounded-lg bg-white border border-gray-300 px-4 py-2.5 text-base text-gray-800 focus:ring-2 focus:ring-indigo-500/70 focus:outline-none placeholder-gray-400 transition-colors" />
);
const Select = ({ name, value, onChange, children }) => (
  <select name={name} value={value} onChange={onChange} className="w-full rounded-lg bg-white border border-gray-300 px-4 py-2.5 text-base text-gray-800 focus:ring-2 focus:ring-indigo-500/70 focus:outline-none transition-colors">
    {children}
  </select>
);
const TextArea = ({ name, value, onChange, placeholder, rows = 3 }) => (
  <textarea rows={rows} name={name} value={value} onChange={onChange} placeholder={placeholder}
    className="w-full rounded-lg bg-white border border-gray-300 px-4 py-2.5 text-base text-gray-800 focus:ring-2 focus:ring-indigo-500/70 focus:outline-none resize-y placeholder-gray-400 transition-colors" />
);


const FdpParticipationForm = ({ user, draft, onBack, onLogout, customSubmitHandler, isMagicLink }) => {
  const navigate = useNavigate();
  // Form field state (initializing with defaults; facultyName pulled from logged-in user)
  const [form, setForm] = useState({
    facultyName: user?.name || "",
    academicYear: "",
    programTitle: "",
    organizer: "",
    location: "",
    date: "",
    durationDays: "",
    certificateNo: "",
    // Removed fields kept as internal state or defaults if needed for UI logic
  });
  // proofFile holds the selected certificate (File object)
  const [proofFile, setProofFile] = useState(null);
  // saving / submitting: disable buttons & change labels during async ops
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // draftId tracks the saved draft so subsequent saves update rather than create new
  const [draftId, setDraftId] = useState(draft?.id || null);
  // modal: central feedback surface for success / info / error
  const [modal, setModal] = useState({ open: false, type: "success", title: "", message: "" });
  const [academicYearOptions, setAcademicYearOptions] = useState([]);

  // SECTION_CODE identifies the table/section for backend + draft grouping
  const SECTION_CODE = "6.1.2.2.1";

  useEffect(() => {
    setAcademicYearOptions(getAcademicYearOptions());
  }, []);

  // If a draft is supplied (navigated with draftId), merge its payload
  useEffect(() => {
    if (draft?.payload) setForm((p) => ({ ...p, ...draft.payload }));
    setDraftId(draft?.id || null);
  }, [draft]);

  // Simple helper to mutate a single field
  const updateField = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  // File selection handlers (input click or drag & drop)
  const handleFileChange = (e) => setProofFile(e.target.files?.[0] || null);
  const handleDrop = (e) => { e.preventDefault(); setProofFile(e.dataTransfer.files?.[0] || null); };
  const handleDragOver = (e) => e.preventDefault();

  // Save current form values locally so user can resume later
  const handleSaveDraft = async () => {
    if (!user) { alert("Login required to save draft."); return; }
    setSaving(true);
    const draftData = {
      userId: user.id || user.email,
      sectionCode: SECTION_CODE,
      title: form.programTitle || "Untitled FDP Participation Draft",
      payload: form,
    };
    try {
      await saveDraft(draftData);
      setModal({ open: true, type: "success", title: "Draft Saved", message: "Your progress has been saved locally." });
    } catch (error) {
      setModal({ open: true, type: "error", title: "Save Failed", message: "Could not save draft." });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModal({ open: false, type: "success", title: "", message: "" });

    // Prepare payload with defaults for removed fields and map date
    const payload = {
      ...form,
      eventType: "FDP", // Default
      mode: "Offline", // Default
      level: "National", // Default
      description: "", // Default (Brief Reflection)
      startDate: form.date, // Map date to startDate
      endDate: form.date,   // Map date to endDate (single day)
    };

    // Custom Handler for Magic Links
    if (customSubmitHandler) {
      setSubmitting(true);
      const result = await customSubmitHandler(payload, proofFile);
      setSubmitting(false);
      if (!result.success) {
        setModal({ open: true, type: "error", title: "Submission Failed", message: "Failed to submit via secure link." });
      }
      return;
    }

    await commonHandleSubmit({
      user,
      sectionCode: SECTION_CODE,
      formState: payload,
      file: proofFile,
      callbacks: {
        setSubmitting,
        onSuccess: (res) => {
          setModal({
            open: true,
            type: res.queued ? "info" : "success",
            title: res.queued ? "Offline Submission" : "Submission Successful",
            message: res.message || "Your submission has been successfully sent for review."
          });
        },
        onError: (err) => {
          setModal({ open: true, type: "error", title: "Submission Failed", message: err.message || "A network or server error occurred." });
        },
        requireFile: true,
      }
    });
  };

  const formContent = (
    <div className={isMagicLink ? "" : "max-w-5xl mx-auto space-y-8 p-6 bg-white rounded-xl shadow-xl border border-gray-100"}>
      {/* Header section: metadata + back button */}
      {!isMagicLink && (
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <p className="text-sm text-gray-500 font-mono">Table {SECTION_CODE} · Faculty Contributions</p>
            <h1 className="text-3xl font-semibold text-gray-900">STTP / FDP – Participation</h1>
            <p className="text-base text-gray-600 mt-1">Capture external FDP/STTP programs you have attended outside your parent institution.</p>
          </div>
          {!customSubmitHandler && (
            <button type="button" onClick={() => navigate("/new-submission")} className="text-sm font-medium text-indigo-700 hover:text-indigo-900 border border-indigo-200 rounded-lg px-4 py-2 hover:bg-indigo-50 transition">← Back to New Submission</button>
          )}
        </div>
      )}
      {/* Main form container */}
      <form onSubmit={handleSubmit} className={isMagicLink ? "space-y-8" : "rounded-xl bg-gray-50 px-8 py-8 space-y-8 shadow-inner border border-gray-200"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><Label>Faculty Name</Label><Input name="facultyName" value={form.facultyName} onChange={(e) => updateField("facultyName", e.target.value)} /></div>
          <div>
            <Label>Academic Year</Label>
            <Select name="academicYear" value={form.academicYear} onChange={(e) => updateField("academicYear", e.target.value)}>
              <option value="">Select Year</option>
              {academicYearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-200">
          <div className="space-y-6">
            <div><Label>Name of Program</Label><Input name="programTitle" value={form.programTitle} onChange={(e) => updateField("programTitle", e.target.value)} placeholder="Program title" /></div>
            <div><Label>Organizer</Label><Input name="organizer" value={form.organizer} onChange={(e) => updateField("organizer", e.target.value)} /></div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Date</Label><Input name="date" type="date" value={form.date} onChange={(e) => updateField("date", e.target.value)} /></div>
              <div><Label>Duration (Days)</Label><Input name="durationDays" type="number" min="1" value={form.durationDays} onChange={(e) => updateField("durationDays", e.target.value)} /></div>
            </div>
            <div><Label>Location</Label><Input name="location" value={form.location} onChange={(e) => updateField("location", e.target.value)} /></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-200">
          <div><Label>Certificate Number / ID (optional)</Label><Input name="certificateNo" value={form.certificateNo} onChange={(e) => updateField("certificateNo", e.target.value)} /></div>
        </div>

        {/* Proof (certificate) upload zone */}
        <div className="pt-2 border-t border-gray-200">
          <Label>Required Proof (Certificate)</Label>
          <div onDrop={handleDrop} onDragOver={handleDragOver} onClick={() => document.getElementById("proof-input-fdppart").click()} className={`flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${proofFile ? "border-green-500 bg-green-50" : "border-indigo-300 bg-indigo-50/50 hover:border-indigo-400"} `}>
            <p className="mb-1 font-semibold">Drag & drop file here, or click to browse</p>
            <p className="text-sm text-indigo-500 mb-2">Accepted: PDF, JPG, PNG (Max 5MB)</p>
            <input type="file" id="proof-input-fdppart" className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
            {proofFile && <p className="mt-2 text-sm text-gray-700 font-medium">✅ Selected: <span className="font-bold">{proofFile.name}</span></p>}
          </div>
        </div>
        {/* Action buttons: save draft / finalize submission */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 border-t border-gray-200 mt-6">
          <p className="text-sm text-gray-500">External programs only – parent institution programs belong to a different section.</p>
          <div className="flex gap-3 justify-end">
            {!isMagicLink && !customSubmitHandler && (
              <button type="button" onClick={handleSaveDraft} disabled={saving || submitting} className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-60">{saving ? "Saving..." : "Save as Draft"}</button>
            )}
            <button type="submit" disabled={submitting || saving || !proofFile} className="inline-flex items-center rounded-lg bg-indigo-600 px-5 py-2 text-base font-semibold text-white hover:bg-indigo-700 transition shadow-lg disabled:bg-gray-400">{submitting ? "Submitting..." : "Finalize Submission"}</button>
          </div>
        </div>
      </form>
      {/* Feedback modal (success / error / offline info) */}
      <SubmissionResultModal {...modal} onClose={() => setModal({ ...modal, open: false })} />
    </div>
  );

  if (isMagicLink) return formContent;

  return (
    <FormLayout title="STTP / FDP – Participation" user={user} onBack={onBack || (() => navigate("/new-submission"))} onLogout={onLogout || (() => navigate("/"))}>
      {formContent}
    </FormLayout>
  );
};

export default FdpParticipationForm;
